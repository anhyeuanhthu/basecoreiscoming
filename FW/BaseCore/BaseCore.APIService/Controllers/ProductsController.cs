using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Services;
using System;
using System.Threading.Tasks;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string keyword = "",
            [FromQuery] int? categoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (products, totalCount) = await _productService.SearchAsync(keyword, categoryId, page, pageSize);
            return Ok(new
            {
                data = products,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            return Ok(product);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            if (product == null || string.IsNullOrEmpty(product.Name))
                return BadRequest(new { message = "Product name is required" });

            try
            {
                var created = await _productService.CreateProductAsync(product);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create product: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            if (product == null)
                return BadRequest(new { message = "Invalid request" });

            var existing = await _productService.GetProductByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Product not found" });

            existing.Name = product.Name ?? existing.Name;
            existing.Price = product.Price;
            existing.Stock = product.Stock;
            existing.CategoryId = product.CategoryId > 0 ? product.CategoryId : existing.CategoryId;
            existing.Description = product.Description ?? existing.Description;
            existing.ImageUrl = product.ImageUrl ?? existing.ImageUrl;

            await _productService.UpdateProductAsync(existing);
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _productService.GetProductByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Product not found" });

            await _productService.DeleteProductAsync(id);
            return NoContent();
        }
    }
}

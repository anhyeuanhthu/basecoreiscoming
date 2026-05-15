using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly IProductRepositoryEF _productRepository;

        public CategoriesController(
            ICategoryRepositoryEF categoryRepository,
            IProductRepositoryEF productRepository)
        {
            _categoryRepository = categoryRepository;
            _productRepository = productRepository;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryRepository.GetAllAsync();

            var result = new List<object>();
            foreach (var cat in categories)
            {
                var productCount = await _productRepository.GetQueryable()
                    .Where(p => p.CategoryId == cat.Id)
                    .CountAsync();

                result.Add(new
                {
                    cat.Id,
                    cat.Name,
                    cat.Description,
                    productCount
                });
            }

            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            if (string.IsNullOrEmpty(category.Name))
                return BadRequest(new { message = "Category name is required" });

            await _categoryRepository.AddAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Category category)
        {
            if (id != category.Id)
                return BadRequest(new { message = "ID mismatch" });

            var existingCategory = await _categoryRepository.GetByIdAsync(id);
            if (existingCategory == null)
                return NotFound(new { message = "Category not found" });

            existingCategory.Name = category.Name;
            existingCategory.Description = category.Description;

            await _categoryRepository.UpdateAsync(existingCategory);
            return Ok(existingCategory);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            var productCount = await _productRepository.GetQueryable()
                .Where(p => p.CategoryId == id)
                .CountAsync();

            if (productCount > 0)
                return BadRequest(new { message = $"Cannot delete category with {productCount} products. Please reassign or delete products first." });

            await _categoryRepository.DeleteAsync(category);
            return Ok(new { message = "Category deleted successfully" });
        }
    }
}
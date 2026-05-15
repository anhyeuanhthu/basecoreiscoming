using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly IProductImageRepositoryEF _productImageRepository;

        public ProductsController(
            IProductRepositoryEF productRepository,
            ICategoryRepositoryEF categoryRepository,
            IProductImageRepositoryEF productImageRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _productImageRepository = productImageRepository;
        }

        // GET: api/products
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] int? categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var (products, totalCount) = await _productRepository.SearchAsync(keyword, categoryId, page, pageSize);
            return Ok(new
            {
                items = products,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        // GET: api/products/search
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? keyword,
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sortBy,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var (products, totalCount) = await _productRepository.SearchAdvancedAsync(
                keyword, categoryId, minPrice, maxPrice, sortBy, page, pageSize);
            return Ok(new
            {
                items = products,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return NotFound();

            var images = await _productImageRepository.GetByProductIdAsync(id);
            var result = new
            {
                product.Id,
                product.Name,
                product.Price,
                product.Stock,
                product.Description,
                product.CategoryId,
                Category = product.Category?.Name,
                product.ImageUrl,
                Images = images.Select(i => new { i.ImageUrl, i.IsMain, i.DisplayOrder })
            };
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null) return BadRequest("Category not found");

            var product = new Product
            {
                Name = dto.Name,
                Price = dto.Price,
                Stock = dto.Stock,
                CategoryId = dto.CategoryId,
                Description = dto.Description ?? "",
                ImageUrl = dto.ImageUrls.Count > 0 ? dto.ImageUrls[dto.MainImageIndex] : ""
            };

            await _productRepository.AddAsync(product);

            for (int i = 0; i < dto.ImageUrls.Count; i++)
            {
                var img = new ProductImage
                {
                    ProductId = product.Id,
                    ImageUrl = dto.ImageUrls[i],
                    IsMain = (i == dto.MainImageIndex),
                    DisplayOrder = i
                };
                await _productImageRepository.AddAsync(img);
            }

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return NotFound();

            if (!string.IsNullOrEmpty(dto.Name)) product.Name = dto.Name;
            if (dto.Price.HasValue) product.Price = dto.Price.Value;
            if (dto.Stock.HasValue) product.Stock = dto.Stock.Value;
            if (dto.CategoryId.HasValue) product.CategoryId = dto.CategoryId.Value;
            if (dto.Description != null) product.Description = dto.Description;

            if (dto.ImageUrls != null)
            {
                await _productImageRepository.DeleteByProductIdAsync(id);
                for (int i = 0; i < dto.ImageUrls.Count; i++)
                {
                    var img = new ProductImage
                    {
                        ProductId = id,
                        ImageUrl = dto.ImageUrls[i],
                        IsMain = (dto.MainImageIndex.HasValue && dto.MainImageIndex.Value == i),
                        DisplayOrder = i
                    };
                    await _productImageRepository.AddAsync(img);
                }
                product.ImageUrl = dto.ImageUrls.Count > 0
                    ? dto.ImageUrls[dto.MainImageIndex ?? 0]
                    : "";
            }

            await _productRepository.UpdateAsync(product);
            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return NotFound();
            await _productImageRepository.DeleteByProductIdAsync(id);
            await _productRepository.DeleteAsync(product);
            return Ok(new { message = "Deleted" });
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var products = await _productRepository.GetByCategoryAsync(categoryId);
            return Ok(products);
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only image files are allowed" });

            var fileName = $"{Guid.NewGuid()}{extension}";
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/images/products/{fileName}";
            return Ok(new { url = imageUrl });
        }
    }

    public class ProductCreateDto
    {
        public string Name { get; set; } = "";
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public string? Description { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public int MainImageIndex { get; set; } = 0;
    }

    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Stock { get; set; }
        public int? CategoryId { get; set; }
        public string? Description { get; set; }
        public List<string>? ImageUrls { get; set; }
        public int? MainImageIndex { get; set; }
    }
}
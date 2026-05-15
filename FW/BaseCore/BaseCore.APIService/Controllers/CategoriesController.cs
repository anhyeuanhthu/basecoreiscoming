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
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            if (category == null || string.IsNullOrEmpty(category.Name))
                return BadRequest(new { message = "Category name is required" });

            try
            {
                var created = await _categoryService.CreateAsync(category);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create category: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] Category category)
        {
            if (category == null)
                return BadRequest(new { message = "Invalid request" });

            var existing = await _categoryService.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Category not found" });

            existing.Name = category.Name ?? existing.Name;
            existing.Description = category.Description ?? existing.Description;

            await _categoryService.UpdateAsync(existing);
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _categoryService.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Category not found" });

            await _categoryService.DeleteAsync(id);
            return NoContent();
        }
    }
}

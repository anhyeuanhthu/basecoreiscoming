using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface IProductImageRepositoryEF : IRepository<ProductImage>
    {
        Task<List<ProductImage>> GetByProductIdAsync(int productId);
        Task DeleteByProductIdAsync(int productId);
    }

    public class ProductImageRepositoryEF : Repository<ProductImage>, IProductImageRepositoryEF
    {
        public ProductImageRepositoryEF(MySqlDbContext context) : base(context) { }

        public async Task<List<ProductImage>> GetByProductIdAsync(int productId)
        {
            return await _dbSet.Where(pi => pi.ProductId == productId)
                               .OrderBy(pi => pi.DisplayOrder)
                               .ToListAsync();
        }

        public async Task DeleteByProductIdAsync(int productId)
        {
            var images = await GetByProductIdAsync(productId);
            _dbSet.RemoveRange(images);
            await _context.SaveChangesAsync();
        }
    }
}
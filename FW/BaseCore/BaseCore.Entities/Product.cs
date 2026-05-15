// BaseCore.Entities/Product.cs (thêm relationship)
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        public string ImageUrl { get; set; }

        // Navigation property
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; }
    }
}
// BaseCore.Entities/User.cs (sửa lại)
using System.ComponentModel.DataAnnotations;

namespace BaseCore.Entities
{
    public class User
    {
        [Key]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString(); // Tạo ID tự động

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }

        public byte[] Salt { get; set; }

        [MaxLength(200)]
        public string Name { get; set; }

        [MaxLength(200)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(200)]
        public string Position { get; set; }

        public string Contact { get; set; }

        public string Image { get; set; }

        public bool IsActive { get; set; } = true;

        public int UserType { get; set; } // 1: Admin, 2: Normal User

        public DateTime Created { get; set; } = DateTime.Now;
    }
}
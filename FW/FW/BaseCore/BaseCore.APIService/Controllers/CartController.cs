using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;

namespace BaseCore.APIService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly IMemoryCache _cache;
        private readonly IProductRepositoryEF _productRepository;
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private const string CART_PREFIX = "cart_";

        public CartController(
            IMemoryCache cache,
            IProductRepositoryEF productRepository,
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository)
        {
            _cache = cache;
            _productRepository = productRepository;
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
        }

        private string GetCartKey(string userId) => $"{CART_PREFIX}{userId}";

        private CartModel GetCart(string userId)
        {
            var key = GetCartKey(userId);
            return _cache.Get<CartModel>(key) ?? new CartModel { UserId = userId, Items = new List<CartItemModel>() };
        }

        private void SaveCart(CartModel cart)
        {
            var key = GetCartKey(cart.UserId);
            cart.LastUpdated = DateTime.Now;
            _cache.Set(key, cart, TimeSpan.FromDays(7));
        }

        [HttpGet]
        public IActionResult GetCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            return Ok(GetCart(userId));
        }

        [HttpPost("add")]
        public IActionResult AddToCart([FromBody] AddToCartRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = GetCart(userId);
            var existing = cart.Items.FirstOrDefault(x => x.ProductId == request.ProductId);

            if (existing != null)
                existing.Quantity += request.Quantity;
            else
                cart.Items.Add(new CartItemModel
                {
                    ProductId = request.ProductId,
                    ProductName = request.ProductName,
                    Price = request.Price,
                    Quantity = request.Quantity,
                    Image = request.Image
                });

            SaveCart(cart);
            return Ok(cart);
        }

        [HttpPut("update")]
        public IActionResult UpdateQuantity([FromBody] UpdateCartRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = GetCart(userId);
            var item = cart.Items.FirstOrDefault(x => x.ProductId == request.ProductId);

            if (item != null)
            {
                if (request.Quantity <= 0)
                    cart.Items.Remove(item);
                else
                    item.Quantity = request.Quantity;
            }

            SaveCart(cart);
            return Ok(cart);
        }

        [HttpDelete("remove/{productId}")]
        public IActionResult RemoveFromCart(string productId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = GetCart(userId);
            cart.Items.RemoveAll(x => x.ProductId == productId);
            SaveCart(cart);
            return Ok(cart);
        }

        [HttpDelete("clear")]
        public IActionResult ClearCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            _cache.Remove(GetCartKey(userId));
            return Ok(new { message = "Cart cleared" });
        }

        [HttpPost("buy-now")]
        public async Task<IActionResult> BuyNow([FromBody] BuyNowRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var items = new List<CartItemModel>
            {
                new CartItemModel
                {
                    ProductId = request.ProductId,
                    ProductName = request.ProductName,
                    Price = request.Price,
                    Quantity = request.Quantity,
                    Image = request.Image
                }
            };

            var result = await CreateOrder(userId, items, request.CheckoutInfo);
            return Ok(result);
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var cart = GetCart(userId);
            if (cart.Items.Count == 0)
                return Ok(new CheckoutResponse { Success = false, Message = "Giỏ hàng trống!" });

            var result = await CreateOrder(userId, cart.Items, request);
            if (result.Success)
                _cache.Remove(GetCartKey(userId));

            return Ok(result);
        }

        private async Task<CheckoutResponse> CreateOrder(string userId, List<CartItemModel> items, CheckoutRequest request)
        {
            // userId đã là string từ JWT, không cần parse
            var totalAmount = items.Sum(x => x.Total);

            var order = new Order
            {
                UserId = userId,  // ✅ string
                OrderDate = DateTime.Now,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = $"{request.FullName}|{request.Phone}|{request.Address}|{request.Note}"
            };

            await _orderRepository.AddAsync(order);

            foreach (var item in items)
            {
                if (!int.TryParse(item.ProductId, out int productId))
                    continue;

                var orderDetail = new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = productId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Price
                };
                await _orderDetailRepository.AddAsync(orderDetail);
            }

            return new CheckoutResponse
            {
                Success = true,
                Message = "Đặt hàng thành công!",
                OrderId = order.Id.ToString(),
                Total = totalAmount
            };
        }
    }

    // Models
    public class CartModel
    {
        public string UserId { get; set; }
        public List<CartItemModel> Items { get; set; } = new List<CartItemModel>();
        public DateTime LastUpdated { get; set; }
        public decimal SubTotal => Items.Sum(x => x.Total);
        public decimal ShippingFee => 30000m;
        public decimal Total => SubTotal + ShippingFee;
    }

    public class CartItemModel
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Image { get; set; }
        public decimal Total => Price * Quantity;
    }

    public class AddToCartRequest
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Image { get; set; }
    }

    public class UpdateCartRequest
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CheckoutRequest
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Note { get; set; }
        public string PaymentMethod { get; set; }
    }

    public class BuyNowRequest
    {
        public string ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Image { get; set; }
        public CheckoutRequest CheckoutInfo { get; set; }
    }

    public class CheckoutResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string OrderId { get; set; }
        public decimal Total { get; set; }
    }
}
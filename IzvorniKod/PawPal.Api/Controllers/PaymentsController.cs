using Microsoft.AspNetCore.Mvc;
using PawPal.Api.Services.Interfaces;

namespace PawPal.Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPayPalService _payPal;

        public PaymentsController(IPayPalService payPal)
        {
            _payPal = payPal;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] decimal amount)
        {
            var orderId = await _payPal.CreateOrderAsync(amount);
            return Ok(new { orderId });
        }

        [HttpPost("capture-order")]
        public async Task<IActionResult> CaptureOrder([FromBody] string orderId)
        {
            var success = await _payPal.CaptureOrderAsync(orderId);
            if (!success) return BadRequest();
            return Ok();
        }
    }
}

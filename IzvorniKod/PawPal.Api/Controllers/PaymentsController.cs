using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;
using PawPal.Api.Services.Interfaces;
using System.Security.Claims;

namespace PawPal.Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPayPalService _payPal;
        private readonly AppDbContext _db;

        public PaymentsController(IPayPalService payPal, AppDbContext db)
        {
            _payPal = payPal;
            _db = db;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        /// <summary>
        /// Get membership pricing (public endpoint)
        /// </summary>
        [HttpGet("membership-pricing")]
        [ProducesResponseType(typeof(MembershipPricingPublicDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<MembershipPricingPublicDto>> GetMembershipPricing()
        {
            var pricing = await _payPal.GetMembershipPricingAsync();
            return Ok(pricing);
        }

        /// <summary>
        /// Create a subscription order for the authenticated walker
        /// </summary>
        [Authorize]
        [HttpPost("subscribe")]
        [ProducesResponseType(typeof(SubscribeResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SubscribeResponse>> Subscribe([FromBody] SubscribeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Plan) || 
                (request.Plan.ToLower() != "monthly" && request.Plan.ToLower() != "yearly"))
            {
                return BadRequest(new { error = "Plan must be 'monthly' or 'yearly'" });
            }

            var userId = GetUserId();
            
            // Check if user is a walker
            var walker = await _db.Setaci.FirstOrDefaultAsync(s => s.IdKorisnik == userId);
            if (walker == null)
            {
                return BadRequest(new { error = "Only walkers can subscribe to membership" });
            }

            var response = await _payPal.CreateSubscriptionOrderAsync(request.Plan);
            return Ok(response);
        }

        /// <summary>
        /// Capture subscription payment and activate membership
        /// </summary>
        [Authorize]
        [HttpPost("capture-subscription/{orderId}")]
        [ProducesResponseType(typeof(SubscriptionStatusDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<SubscriptionStatusDto>> CaptureSubscription(string orderId, [FromBody] SubscribeRequest request)
        {
            var success = await _payPal.CaptureOrderAsync(orderId);
            if (!success)
            {
                return BadRequest(new { error = "Payment capture failed" });
            }

            var userId = GetUserId();
            var walker = await _db.Setaci.FirstOrDefaultAsync(s => s.IdKorisnik == userId);
            if (walker == null)
            {
                return BadRequest(new { error = "Walker not found" });
            }

            // Deactivate any existing active subscriptions
            var existingActive = await _db.Clanarine
                .Where(c => c.IdKorisnik == userId && c.StatusClanarina == "aktivna")
                .ToListAsync();

            foreach (var existing in existingActive)
            {
                existing.StatusClanarina = "zamrznuta";
            }

            // Create new subscription
            var isYearly = request.Plan?.ToLower() == "yearly";
            var now = DateTime.UtcNow;
            var expiry = isYearly ? now.AddYears(1) : now.AddMonths(1);

            var subscription = new Clanarina
            {
                IdKorisnik = userId,
                VrstaClanarina = isYearly ? "godisnja" : "mjesecna",
                DatumPocetkaClanarina = now,
                DatumIstekaClanarina = expiry,
                StatusClanarina = "aktivna"
            };

            _db.Clanarine.Add(subscription);
            await _db.SaveChangesAsync();

            return Ok(new SubscriptionStatusDto(
                true,
                isYearly ? "yearly" : "monthly",
                now,
                expiry,
                "aktivna"
            ));
        }

        /// <summary>
        /// Get current user's subscription status
        /// </summary>
        [Authorize]
        [HttpGet("my-subscription")]
        [ProducesResponseType(typeof(SubscriptionStatusDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<SubscriptionStatusDto>> GetMySubscription()
        {
            var userId = GetUserId();

            // Check if user is a walker
            var walker = await _db.Setaci.FirstOrDefaultAsync(s => s.IdKorisnik == userId);
            if (walker == null)
            {
                return Ok(new SubscriptionStatusDto(false, null, null, null, null));
            }

            // Get active subscription
            var subscription = await _db.Clanarine
                .Where(c => c.IdKorisnik == userId && c.StatusClanarina == "aktivna")
                .OrderByDescending(c => c.DatumIstekaClanarina)
                .FirstOrDefaultAsync();

            if (subscription == null)
            {
                return Ok(new SubscriptionStatusDto(false, null, null, null, null));
            }

            // Check if subscription has expired
            if (subscription.DatumIstekaClanarina < DateTime.UtcNow)
            {
                subscription.StatusClanarina = "istekla";
                await _db.SaveChangesAsync();
                return Ok(new SubscriptionStatusDto(false, null, null, null, "istekla"));
            }

            var plan = subscription.VrstaClanarina == "godisnja" ? "yearly" : "monthly";

            return Ok(new SubscriptionStatusDto(
                true,
                plan,
                subscription.DatumPocetkaClanarina,
                subscription.DatumIstekaClanarina,
                subscription.StatusClanarina
            ));
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

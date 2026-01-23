using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalHttp;
using PawPal.Api.Data;
using PawPal.Api.DTOs;
using PawPal.Api.Models;
using PawPal.Api.Services.Interfaces;

namespace PawPal.Api.Services.Implementations
{
    public class PayPalService : IPayPalService
    {
        private readonly PayPalHttpClient _client;
        private readonly AppDbContext _db;

        public PayPalService(IConfiguration config, AppDbContext db)
        {
            var env = new SandboxEnvironment(
                config["PayPal:ClientId"],
                config["PayPal:Secret"]
            );

            _client = new PayPalHttpClient(env);
            _db = db;
        }

        public async Task<MembershipPricingPublicDto> GetMembershipPricingAsync()
        {
            var pricing = await _db.MembershipSettings.FirstOrDefaultAsync();
            if (pricing == null)
            {
                return new MembershipPricingPublicDto(9.99m, 99.99m, "EUR");
            }
            return new MembershipPricingPublicDto(pricing.MonthlyPrice, pricing.YearlyPrice, pricing.Currency);
        }

        public async Task<SubscribeResponse> CreateSubscriptionOrderAsync(string plan)
        {
            var pricing = await GetMembershipPricingAsync();
            
            decimal amount = plan.ToLower() == "yearly" ? pricing.YearlyPrice : pricing.MonthlyPrice;
            string currency = pricing.Currency;

            var request = new OrdersCreateRequest();
            request.Prefer("return=representation");

            request.RequestBody(new OrderRequest
            {
                CheckoutPaymentIntent = "CAPTURE",
                PurchaseUnits = new List<PurchaseUnitRequest>
                {
                    new PurchaseUnitRequest
                    {
                        AmountWithBreakdown = new AmountWithBreakdown
                        {
                            CurrencyCode = currency,
                            Value = amount.ToString("0.00")
                        },
                        Description = $"PawPal Walker {plan} Subscription"
                    }
                }
            });

            var response = await _client.Execute(request);
            var order = response.Result<Order>();

            return new SubscribeResponse(order.Id, amount, currency, plan);
        }

        public async Task<string> CreateOrderAsync(decimal amount)
        {
            var request = new OrdersCreateRequest();
            request.Prefer("return=representation");

            request.RequestBody(new OrderRequest
            {
                CheckoutPaymentIntent = "CAPTURE",
                PurchaseUnits = new List<PurchaseUnitRequest>
                {
                    new PurchaseUnitRequest
                    {
                        AmountWithBreakdown = new AmountWithBreakdown
                        {
                            CurrencyCode = "EUR",
                            Value = amount.ToString("0.00")
                        }
                    }
                }
            });

            var response = await _client.Execute(request);
            var order = response.Result<Order>();

            return order.Id;
        }

        public async Task<bool> CaptureOrderAsync(string orderId)
        {
            var request = new OrdersCaptureRequest(orderId);
            request.RequestBody(new OrderActionRequest());

            var response = await _client.Execute(request);
            var order = response.Result<Order>();

            return order.Status == "COMPLETED";
        }
    }
}

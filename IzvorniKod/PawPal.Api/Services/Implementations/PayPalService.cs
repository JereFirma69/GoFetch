using Microsoft.Extensions.Configuration;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using PayPalHttp;
using PawPal.Api.Services.Interfaces;

namespace PawPal.Api.Services.Implementations
{
    public class PayPalService : IPayPalService
    {
        private readonly PayPalHttpClient _client;

        public PayPalService(IConfiguration config)
        {
            var env = new SandboxEnvironment(
                config["PayPal:ClientId"],
                config["PayPal:Secret"]
            );

            _client = new PayPalHttpClient(env);
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

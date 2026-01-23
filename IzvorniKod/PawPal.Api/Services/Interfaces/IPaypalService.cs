using PawPal.Api.DTOs;

namespace PawPal.Api.Services.Interfaces
{
    public interface IPayPalService
    {
        Task<string> CreateOrderAsync(decimal amount);
        Task<bool> CaptureOrderAsync(string orderId);
        
        // Subscription methods
        Task<MembershipPricingPublicDto> GetMembershipPricingAsync();
        Task<SubscribeResponse> CreateSubscriptionOrderAsync(string plan);
    }
}
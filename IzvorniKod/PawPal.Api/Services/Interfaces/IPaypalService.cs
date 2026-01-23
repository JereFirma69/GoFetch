namespace PawPal.Api.Services.Interfaces
{
    public interface IPayPalService
    {
        Task<string> CreateOrderAsync(decimal amount);
        Task<bool> CaptureOrderAsync(string orderId);

        // kasnije za subskripcije eventualno
    }
}
namespace PawPal.Api.Services;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default);
    Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

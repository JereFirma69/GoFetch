using Azure;
using Azure.Communication.Email;
using Microsoft.Extensions.Options;
using PawPal.Api.Configuration;

namespace PawPal.Api.Services.Implementations;

public class EmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly EmailClient? _emailClient;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailOptions> options, ILogger<EmailService> logger)
    {
        _options = options.Value;
        _logger = logger;

        if ((_options.Provider == "AzureCommunication" || _options.Provider == "AzureCommunicationServices")
            && !string.IsNullOrEmpty(_options.ConnectionString))
        {
            _emailClient = new EmailClient(_options.ConnectionString);
            _logger.LogInformation("EmailService initialized with provider {Provider}", _options.Provider);
        }
        else
        {
            _logger.LogWarning("EmailService not fully configured. Provider={Provider}, HasConnectionString={HasCS}", _options.Provider, !string.IsNullOrEmpty(_options.ConnectionString));
        }
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset Your PawPal Password";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <div style='background-color: #4F46E5; padding: 20px; text-align: center;'>
                    <h1 style='color: white; margin: 0;'>PawPal</h1>
                </div>
                <div style='padding: 30px; background-color: #f9fafb;'>
                    <h2 style='color: #1f2937;'>Password Reset Request</h2>
                    <p style='color: #4b5563;'>You requested to reset your password. Click the button below to set a new password:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{resetLink}' style='background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;'>Reset Password</a>
                    </div>
                    <p style='color: #6b7280; font-size: 14px;'>This link will expire in 60 minutes.</p>
                    <p style='color: #6b7280; font-size: 14px;'>If you didn't request this, you can safely ignore this email.</p>
                </div>
                <div style='padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;'>
                    <p>© 2026 PawPal. All rights reserved.</p>
                </div>
            </body>
            </html>";

        await SendEmailAsync(toEmail, subject, htmlBody, ct);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        if ((_options.Provider == "AzureCommunication" || _options.Provider == "AzureCommunicationServices") 
            && _emailClient != null)
        {
            await SendWithAzureAsync(toEmail, subject, htmlBody, ct);
        }
        else
        {
            // Fallback: log the email (for development)
            _logger.LogInformation("Email would be sent to {ToEmail} with subject: {Subject}", toEmail, subject);
            _logger.LogDebug("Email body: {Body}", htmlBody);
        }
    }

    private async Task SendWithAzureAsync(string toEmail, string subject, string htmlBody, CancellationToken ct)
    {
        try
        {
            var senderAddress = _options.FromEmail; // Azure Communication requires a valid sender email from the resource
            if (string.IsNullOrEmpty(senderAddress))
            {
                _logger.LogError("Email FromEmail is not configured. Cannot send password reset email.");
                throw new InvalidOperationException("Email sender address is not configured.");
            }
                
            var emailMessage = new EmailMessage(
                senderAddress: senderAddress,
                recipientAddress: toEmail,
                content: new EmailContent(subject)
                {
                    Html = htmlBody
                });

            var operation = await _emailClient!.SendAsync(WaitUntil.Started, emailMessage, ct);
            _logger.LogInformation("Email sent to {ToEmail}, operation ID: {OperationId}", toEmail, operation.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            throw;
        }
    }
}

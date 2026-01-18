namespace PawPal.Api.Configuration;

public class EmailOptions
{
    public string Provider { get; set; } = "AzureCommunication"; // AzureCommunication or SendGrid
    public string ConnectionString { get; set; } = string.Empty; // For Azure Communication Services
    public string ApiKey { get; set; } = string.Empty; // For SendGrid
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "PawPal";
}

namespace PawPal.Api.Configuration;

public class StreamOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string ApiUrl { get; set; } = "https://chat.stream-io-api.com";
}

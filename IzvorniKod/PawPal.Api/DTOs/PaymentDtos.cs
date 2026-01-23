namespace PawPal.Api.DTOs;

public record MembershipPricingPublicDto(
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string Currency
);

public record SubscribeRequest(string Plan); // "monthly" or "yearly"

public record SubscribeResponse(string OrderId, decimal Amount, string Currency, string Plan);

public record SubscriptionStatusDto(
    bool HasActiveSubscription,
    string? Plan,
    DateTime? StartDate,
    DateTime? ExpiryDate,
    string? Status
);

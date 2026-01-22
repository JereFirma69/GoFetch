namespace PawPal.Api.DTOs;

public record MembershipPricingDto(
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string Currency);

public record UpdateMembershipPricingRequest(
    decimal MonthlyPrice,
    decimal YearlyPrice,
    string Currency);

public record AdminUserDto(
    int UserId,
    string Email,
    string? FirstName,
    string? LastName,
    string Role,
    string? Location,
    string? Phone,
    bool? IsVerified,
    string? ProfilePicture);

public record WalkerSearchResultDto(
    int WalkerId,
    string FullName,
    string Location,
    decimal? LowestPrice,
    decimal? HighestPrice,
    double Rating,
    int RatingCount,
    string? ProfilePicture,
    bool IsVerified,
    string? Bio,
    string? Email,
    string? Phone);

public record TerminSearchResultDto(
    int TerminId,
    DateTime Start,
    TimeSpan Duration,
    string Location,
    decimal Price,
    string Type,
    int MaxDogs,
    int BookedDogs,
    bool IsAvailable,
    int WalkerId,
    string WalkerName,
    string? WalkerProfilePicture);

using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface ISearchService
{
    Task<IEnumerable<WalkerSearchResultDto>> SearchWalkersAsync(
        string? location,
        decimal? minPrice,
        decimal? maxPrice,
        double? minRating,
        string? query,
        CancellationToken ct = default);

    Task<IEnumerable<TerminSearchResultDto>> SearchTerminiAsync(
        DateTime? from,
        DateTime? to,
        string? location,
        int? walkerId,
        decimal? minPrice,
        decimal? maxPrice,
        string? type,
        bool? onlyAvailable,
        CancellationToken ct = default);

    Task<IEnumerable<WalkerReviewDto>> GetWalkerReviewsAsync(
        int walkerId,
        int limit = 3,
        CancellationToken ct = default);
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawPal.Api.Services;

namespace PawPal.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet("walkers")]
    public async Task<IActionResult> SearchWalkers(
        [FromQuery] string? location,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] double? minRating,
        [FromQuery] string? q,
        CancellationToken ct)
    {
        var walkers = await _searchService.SearchWalkersAsync(location, minPrice, maxPrice, minRating, q, ct);
        return Ok(walkers);
    }

    [HttpGet("walkers/{walkerId}/reviews")]
    public async Task<IActionResult> GetWalkerReviews(
        int walkerId,
        [FromQuery] int limit = 3,
        CancellationToken ct = default)
    {
        var reviews = await _searchService.GetWalkerReviewsAsync(walkerId, limit, ct);
        return Ok(reviews);
    }

    [HttpGet("termini")]
    public async Task<IActionResult> SearchTermini(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? location,
        [FromQuery] int? walkerId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? type,
        [FromQuery] bool? onlyAvailable,
        CancellationToken ct)
    {
        var termini = await _searchService.SearchTerminiAsync(from, to, location, walkerId, minPrice, maxPrice, type, onlyAvailable, ct);
        return Ok(termini);
    }
}

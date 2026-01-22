using PawPal.Api.DTOs;

namespace PawPal.Api.Services;

public interface IAdminService
{
    Task<IEnumerable<PendingWalkerDto>> GetPendingWalkersAsync(CancellationToken ct = default);
    Task<VerificationResultDto> ApproveWalkerAsync(int adminId, ApproveWalkerRequest request, CancellationToken ct = default);
    Task<VerificationResultDto> RejectWalkerAsync(int adminId, RejectWalkerRequest request, CancellationToken ct = default);
    Task<WalkerVerificationStatusDto> GetWalkerVerificationStatusAsync(int walkerId, CancellationToken ct = default);

    Task<MembershipPricingDto> GetMembershipPricingAsync(CancellationToken ct = default);
    Task<MembershipPricingDto> UpdateMembershipPricingAsync(UpdateMembershipPricingRequest request, CancellationToken ct = default);

    Task<(IEnumerable<AdminUserDto> Users, int TotalCount)> SearchUsersAsync(string? role, string? query, CancellationToken ct = default);
}

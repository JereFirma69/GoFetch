namespace PawPal.Api.DTOs;


public record ProfileResponse(
    int UserId,
    string Email,
    string? FirstName,
    string? LastName,
    string? ProfilePicture,
    OwnerProfileDto? Owner,
    WalkerProfileDto? Walker);

public record OwnerProfileDto(
    int OwnerId,
    IEnumerable<DogDto> Dogs);

public record WalkerProfileDto(
    int WalkerId,
    string FirstName,
    string LastName,
    string Location,
    string Phone,
    string ProfilePicture,
    string VerificationStatus,
    bool IsVerified);

public record UpdateOwnerRequest(
    string FirstName,
    string LastName);

public record UpdateProfileRequest(
    string? FirstName,
    string? LastName,
    string? ProfilePicture,
    WalkerDetailsDto? WalkerDetails);

public record WalkerDetailsDto(
    string Location,
    string Phone,
    string? WalkerProfilePicture);

public record UpdateWalkerRequest(
    string FirstName,
    string LastName,
    string Location,
    string Phone,
    string? ProfilePicture);


public record DogDto(
    int IdPas,
    string ImePas,
    string Poslastice,
    string Socijalizacija,
    int RazinaEnergije,
    string? ZdravstveneNapomene,
    int Starost,
    string Pasmina,
    string ProfilnaPas);

public record CreateDogRequest(
    string ImePas,
    string Poslastice,
    string Socijalizacija,
    int RazinaEnergije,
    string? ZdravstveneNapomene,
    int Starost,
    string Pasmina,
    string ProfilnaPas);

public record UpdateDogRequest(
    string ImePas,
    string Poslastice,
    string Socijalizacija,
    int RazinaEnergije,
    string? ZdravstveneNapomene,
    int Starost,
    string Pasmina,
    string ProfilnaPas);

// Admin Verification DTOs
public record PendingWalkerDto(
    int WalkerId,
    string Email,
    string FirstName,
    string LastName,
    string Location,
    string Phone,
    string ProfilePicture);

public record ApproveWalkerRequest(
    int WalkerId);

public record RejectWalkerRequest(
    int WalkerId);

public record VerificationResultDto(
    int WalkerId,
    bool Success,
    string Message);

public record WalkerVerificationStatusDto(
    int WalkerId,
    string Email,
    string VerificationStatus,
    bool IsVerified);

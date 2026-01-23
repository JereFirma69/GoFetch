using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PawPal.Api.Services.Implementations;
using PawPal.Api.Services;
using PawPal.Api.Data;
using PawPal.Api.Configuration;
using PawPal.Api.DTOs;
using PawPal.Api.Models;

public class AuthServiceTests {
    private AuthService CreateService(AppDbContext db) {
        var jwtOptions = Options.Create(new JwtOptions {
            Key = "TEST_KEY_TEST_KEY_TEST_KEY_123456",
            Issuer = "test",
            Audience = "test",
            ExpiresMinutes = 60,
            RefreshTokenExpiresDays = 7
        });
        var emailMock = new Mock<IEmailService>();
        var config = new ConfigurationBuilder().Build();
        var logger = NullLogger<AuthService>.Instance;
        return new AuthService(db, jwtOptions, config, emailMock.Object, logger);
    }
    private AppDbContext CreateDb() {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }
    [Fact]
    public async Task Register_Creates_User() {
        var db = CreateDb();
        var service = CreateService(db);
        var request = new RegisterRequest(
            "test@test.com",
            "Password123!",
            "Ivo",
            "Ivić");
            var result = await service.RegisterAsync(request);
            Assert.Equal("test@test.com", result.Email);
    }
    [Fact]
    public async Task Login_With_Wrong_Password_Throws() {
        var db = CreateDb();
        var service = CreateService(db);
        var register = new RegisterRequest(
            "user@test.com",
            "Password123!",
            "Ana",
            "Anić");
        await service.RegisterAsync(register);
        var login = new LoginRequest("user@test.com", "WRONG");
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(login)
            );
    }
    [Fact]
    public async Task Register_WithExistingEmail_ThrowsException() {
        var db = CreateDb();
        var service = CreateService(db);
        var request = new RegisterRequest(
            Email: "test@test.com",
            Password: "Password123!",
            FirstName: "Test",
            LastName: "User");
        await service.RegisterAsync(request);
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.RegisterAsync(request)
        );
    }
    [Fact]
    public async Task Login_WithNonExistingUser_ThrowsUnauthorized() {
        var db = CreateDb();
        var service = CreateService(db);
        var request = new LoginRequest(
            Email: "nepostoji@test.com",Password: "Password123!");
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.LoginAsync(request)
        );
    }
    [Fact]
    public async Task Refresh_WithInvalidToken_ThrowsUnauthorized() {
        var db = CreateDb();
        var service = CreateService(db);
        var invalidToken = "ovajTokenNijeValidan";
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            service.RefreshAsync(invalidToken)
        );
    }
    [Fact]
    public async Task ForgotPassword_WithNonExistingEmail_ReturnsSuccess() {
        var db = CreateDb();
        var service = CreateService(db); 
        var request = new ForgotPasswordRequest(Email: "ghost@test.com");
        var result = await service.ForgotPasswordAsync(request, "https://frontend.test");
        Assert.True(result.Success);
    }
}
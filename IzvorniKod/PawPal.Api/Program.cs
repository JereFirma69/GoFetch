using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PawPal.Api.Configuration;
using PawPal.Api.Data;
using PawPal.Api.Services;
using PawPal.Api.Services.Implementations;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;

// PostgreSQL Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

// CORS - Allow React frontend (local + production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:5173";
        var allowedOrigins = new List<string> { frontendUrl };
        
        // Add localhost variations for development
        if (builder.Environment.IsDevelopment())
        {
            allowedOrigins.Add("http://localhost:5173");
            allowedOrigins.Add("http://localhost:5174");
            allowedOrigins.Add("http://localhost:3000");
        }
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT Authentication
builder.Services.Configure<JwtOptions>(config.GetSection("Jwt"));
var jwtOptions = config.GetSection("Jwt").Get<JwtOptions>()!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
        };
    });

builder.Services.AddAuthorization();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProfileService, ProfileService>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "PawPal API", Version = "v1" });
    
    // Add JWT authentication to Swagger
    options.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token in the format: Bearer {your token}"
    });
    
    options.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure HTTP for swagger
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "PawPal API v1");
});

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

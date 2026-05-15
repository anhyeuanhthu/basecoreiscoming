using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using BaseCore.Repository;
using BaseCore.Repository.Authen;
using BaseCore.Services.Authen;
using BaseCore.Common;
using BaseCore.Entities;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BaseCore Auth Service API",
        Version = "v1",
        Description = "Authentication Microservice - Login, Register, User Management"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter JWT token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddDbContext<MySqlDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConnectedDb"));
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "YourSecretKeyForAuthenticationShouldBeLongEnough");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Seed / reset admin password mỗi lần khởi động
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<MySqlDbContext>();
    dbContext.Database.EnsureCreated();

    const string ADMIN_PASSWORD = "Admin@123";

    var existingAdmin = dbContext.Users.FirstOrDefault(u => u.UserName == "admin");
    if (existingAdmin == null)
    {
        // Tạo mới admin
        byte[] salt;
        var hashedPassword = TokenHelper.HashPassword(ADMIN_PASSWORD, out salt);
        await dbContext.Users.AddAsync(new User
        {
            Id = Guid.NewGuid().ToString(),
            UserName = "admin",
            Password = hashedPassword,
            Salt = salt,
            Name = "Administrator",
            Email = "admin@basecoresales.com",
            Phone = "0123456789",
            Position = "System Administrator",
            Contact = string.Empty,
            Image = string.Empty,
            IsActive = true,
            UserType = 1,
            Created = DateTime.Now
        });
        Console.WriteLine($"[SEED] Admin account created with password: {ADMIN_PASSWORD}");
    }
    else
    {
        // Luôn reset password admin về Admin@123 để đảm bảo đúng
        byte[] salt;
        existingAdmin.Password = TokenHelper.HashPassword(ADMIN_PASSWORD, out salt);
        existingAdmin.Salt = salt;
        existingAdmin.IsActive = true;
        existingAdmin.UserType = 1;
        dbContext.Users.Update(existingAdmin);
        Console.WriteLine($"[SEED] Admin password reset to: {ADMIN_PASSWORD}");
    }

    await dbContext.SaveChangesAsync();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("BaseCore Auth Service running on port 5002");
Console.WriteLine("Endpoints: /api/auth, /api/users, /api/roles");
app.Run("http://localhost:5002");

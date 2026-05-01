using Dapper;
using Microsoft.AspNetCore.Identity;

public class UserService
{
    private readonly DapperContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(DapperContext context, IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<IEnumerable<User>> GetAll()
    {
        var sql = "SELECT Id, Name FROM Users ORDER BY Id DESC";
        using var conn = _context.CreateConnection();
        return await conn.QueryAsync<User>(sql);
    }

    public async Task<User?> GetById(int id)
    {
        var sql = "SELECT Id, Name FROM Users WHERE Id = @Id";
        using var conn = _context.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<bool> ExistsByName(string name)
    {
        var sql = "SELECT TOP 1 1 FROM Users WHERE Name = @Name";
        using var conn = _context.CreateConnection();
        var result = await conn.ExecuteScalarAsync<int?>(sql, new { Name = name });
        return result.HasValue;
    }

    public async Task<User?> Authenticate(string name, string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            return null;
        }

        var user = await GetByNameWithPassword(name);
        if (user == null || string.IsNullOrWhiteSpace(user.Password))
        {
            return null;
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.Password, password);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            var newHash = _passwordHasher.HashPassword(user, password);
            await UpdatePasswordHash(user.Id, newHash);
        }

        return new User { Id = user.Id, Name = user.Name };
    }

    public async Task<bool> Create(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        user.Password = _passwordHasher.HashPassword(user, user.Password);
        var sql = @"INSERT INTO Users (Name, Password)
                    VALUES (@Name, @Password)";
        using var conn = _context.CreateConnection();
        var rowsAffected = await conn.ExecuteAsync(sql, user);
        return rowsAffected > 0;
    }

    public async Task<bool> Update(User user)
    {
        using var conn = _context.CreateConnection();
        var rowsAffected = 0;
        if (string.IsNullOrWhiteSpace(user.Password))
        {
            var sql = @"UPDATE Users
                        SET Name = @Name
                        WHERE Id = @Id";
            rowsAffected = await conn.ExecuteAsync(sql, user);
            return rowsAffected > 0;
        }

        user.Password = _passwordHasher.HashPassword(user, user.Password);
        var updateWithPasswordSql = @"UPDATE Users
                                     SET Name = @Name, Password = @Password
                                     WHERE Id = @Id";
        rowsAffected = await conn.ExecuteAsync(updateWithPasswordSql, user);
        return rowsAffected > 0;
    }

    public async Task<bool> Delete(int id)
    {
        var sql = "DELETE FROM Users WHERE Id = @Id";
        using var conn = _context.CreateConnection();
        var rowsAffected = await conn.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    private async Task<User?> GetByNameWithPassword(string name)
    {
        var sql = "SELECT Id, Name, Password FROM Users WHERE Name = @Name";
        using var conn = _context.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Name = name });
    }

    private async Task UpdatePasswordHash(int id, string passwordHash)
    {
        var sql = "UPDATE Users SET Password = @Password WHERE Id = @Id";
        using var conn = _context.CreateConnection();
        await conn.ExecuteAsync(sql, new { Id = id, Password = passwordHash });
    }
}

using Dapper;

public class NoteService
{
    private readonly DapperContext _context;

    public NoteService(DapperContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Note>> GetAll(int userId)
    {
        var sql = "SELECT * FROM Notes WHERE UserId = @UserId ORDER BY CreatedAt DESC";
        using var conn = _context.CreateConnection();
        return await conn.QueryAsync<Note>(sql, new { UserId = userId });
    }

    public async Task<Note?> GetById(int id, int userId)
    {
        var sql = "SELECT * FROM Notes WHERE Id = @Id AND UserId = @UserId";
        using var conn = _context.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<Note>(sql, new { Id = id, UserId = userId });
    }

    public async Task<bool> Create(Note note)
    {
        var sql = @"INSERT INTO Notes (Title, Content, UserId)
                    VALUES (@Title, @Content, @UserId)";
        using var conn = _context.CreateConnection();
        var rowsAffected = await conn.ExecuteAsync(sql, note);
        return rowsAffected > 0;
    }

    public async Task<bool> Update(Note note)
    {
        var sql = @"UPDATE Notes 
                    SET Title = @Title, Content = @Content, UpdatedAt = GETDATE()
                    WHERE Id = @Id AND UserId = @UserId";
        using var conn = _context.CreateConnection();
        var rowsAffected = await conn.ExecuteAsync(sql, note);
        return rowsAffected > 0;
    }

    public async Task<bool> Delete(int id, int userId)
    {
        var sql = "DELETE FROM Notes WHERE Id = @Id AND UserId = @UserId";
        using var conn = _context.CreateConnection();
        var rowsAffected = await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rowsAffected > 0;
    }
}
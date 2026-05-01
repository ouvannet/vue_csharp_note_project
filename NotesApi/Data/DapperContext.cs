using System.Data;
using Microsoft.Data.SqlClient;

public class DapperContext
{
    private readonly IConfiguration _config;

    public DapperContext(IConfiguration config)
    {
        _config = config;
    }

    public IDbConnection CreateConnection()
        => new SqlConnection(_config.GetConnectionString("DefaultConnection"));
}
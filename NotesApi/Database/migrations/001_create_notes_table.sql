IF OBJECT_ID('dbo.Notes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Content NVARCHAR(MAX) NULL,
        UserId INT NOT NULL,
        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME NULL
    );
END;
GO

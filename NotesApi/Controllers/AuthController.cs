using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserService _service;
    private readonly TokenService _tokenService;

    public AuthController(UserService service, TokenService tokenService)
    {
        _service = service;
        _tokenService = tokenService;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Name) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Name and password are required.");
        }

        if (await _service.ExistsByName(request.Name))
        {
            return Conflict("Name already exists.");
        }

        var user = new User { Name = request.Name, Password = request.Password };
        await _service.Create(user);
        return Ok();
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request?.Name) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Name and password are required.");
        }

        var user = await _service.Authenticate(request.Name, request.Password);
        if (user == null)
        {
            return Unauthorized();
        }

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse { Id = user.Id, Name = user.Name, Token = token });
    }
}

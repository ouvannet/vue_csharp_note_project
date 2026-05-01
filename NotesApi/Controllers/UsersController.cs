using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _service;

    public UsersController(UserService service)
    {
        _service = service;
    }

    // GET
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var users = await _service.GetAll();
        return Ok(users);
    }

    // GET by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _service.GetById(id);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    // POST
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] User user)
    {
        var created = await _service.Create(user);
        if (!created)
        {
            return BadRequest();
        }
        return Ok();
    }

    // PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] User user)
    {
        user.Id = id;
        var updated = await _service.Update(user);
        if (!updated)
        {
            return NotFound();
        }
        return Ok();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.Delete(id);
        if (!deleted)
        {
            return NotFound();
        }
        return Ok();
    }
}

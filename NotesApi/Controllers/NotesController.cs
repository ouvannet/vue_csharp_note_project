using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly NoteService _service;

    public NotesController(NoteService service)
    {
        _service = service;
    }

    // GET
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        Console.WriteLine($"UserId from token: {userId}");
        if (userId == null)
        {
            return Unauthorized();
        }

        var notes = await _service.GetAll(userId.Value);
        return Ok(notes);
    }

    // GET by id
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var note = await _service.GetById(id, userId.Value);
        if (note == null)
        {
            return NotFound();
        }

        return Ok(note);
    }

    // POST
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Note note)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        note.UserId = userId.Value;
        var created = await _service.Create(note);
        if (!created)
        {
            return BadRequest();
        }
        return Ok();
    }

    // PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Note note)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        note.Id = id;
        note.UserId = userId.Value;
        var updated = await _service.Update(note);
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
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var deleted = await _service.Delete(id, userId.Value);
        if (!deleted)
        {
            return NotFound();
        }

        return Ok();
    }

    private int? GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdValue) || !int.TryParse(userIdValue, out var userId))
        {
            return null;
        }

        return userId;
    }
}
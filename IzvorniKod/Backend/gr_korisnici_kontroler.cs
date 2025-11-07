[ApiController]
[Route("api/[controller]")]
public class KorisniciController : ControllerBase
{
    private readonly IKorisnikService _korisnikService;

    public KorisniciController(IKorisnikService korisnikService)
    {
        _korisnikService = korisnikService;
    }

    [HttpGet("provjeri-email")]
    public async Task<IActionResult> ProvjeriEmail([FromQuery] string email)
    {
        bool postoji = await _korisnikService.PostojiPoEmailuAsync(email);
        return Ok(new { postoji });
    }
}









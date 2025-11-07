public class AppDbContext : DbContext
{
    public DbSet<Korisnik> Korisnici { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // provjera korsnika po emailu
    public async Task<bool> KorisnikPostojiAsync(string email)
    {
        return await Korisnici.AnyAsync(k => k.EmailKorisnik == email);
    }

    // provjera po ID-u
    public async Task<bool> KorisnikPostojiAsync(int id)
    {
        return await Korisnici.AnyAsync(k => k.IdKorisnik == id);
    }
}



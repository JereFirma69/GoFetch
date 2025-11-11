using Microsoft.EntityFrameworkCore;
using PawPal.Api.Models;

namespace PawPal.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Korisnik> Korisnici => Set<Korisnik>();
    public DbSet<Vlasnik> Vlasnici => Set<Vlasnik>();
    public DbSet<Setac> Setaci => Set<Setac>();
    public DbSet<Administrator> Administratori => Set<Administrator>();
    public DbSet<Pas> Psi => Set<Pas>();
    public DbSet<PretplataVlasnikSetacNovosti> Pretplate => Set<PretplataVlasnikSetacNovosti>();
    public DbSet<Clanarina> Clanarine => Set<Clanarina>();
    public DbSet<Termin> Termini => Set<Termin>();
    public DbSet<Rezervacija> Rezervacije => Set<Rezervacija>();
    public DbSet<Placanje> Placanja => Set<Placanje>();
    public DbSet<Recenzija> Recenzije => Set<Recenzija>();
    public DbSet<Poruka> Poruke => Set<Poruka>();
    public DbSet<RezervacijaPas> RezervacijePsi => Set<RezervacijaPas>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Korisnik>(entity =>
        {
            entity.HasIndex(k => k.EmailKorisnik).IsUnique();
        });


        modelBuilder.Entity<Vlasnik>(entity =>
        {
            entity.HasOne(v => v.Korisnik)
                .WithOne(k => k.Vlasnik)
                .HasForeignKey<Vlasnik>(v => v.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<Setac>(entity =>
        {
            entity.HasOne(s => s.Korisnik)
                .WithOne(k => k.Setac)
                .HasForeignKey<Setac>(s => s.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);


            entity.HasIndex(s => s.LokacijaSetac);
        });

        modelBuilder.Entity<Administrator>(entity =>
        {
            entity.HasOne(a => a.Korisnik)
                .WithOne(k => k.Administrator)
                .HasForeignKey<Administrator>(a => a.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<PretplataVlasnikSetacNovosti>(entity =>
        {
            entity.HasOne(p => p.Vlasnik)
                .WithOne(v => v.Pretplata)
                .HasForeignKey<PretplataVlasnikSetacNovosti>(p => p.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<Pas>(entity =>
        {
            entity.HasOne(p => p.Vlasnik)
                .WithMany(v => v.Psi)
                .HasForeignKey(p => p.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Clanarina>(entity =>
        {
            entity.HasOne(c => c.Setac)
                .WithMany(s => s.Clanarine)
                .HasForeignKey(c => c.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);
        });

      
        modelBuilder.Entity<Termin>(entity =>
        {
            entity.HasOne(t => t.Setac)
                .WithMany(s => s.Termini)
                .HasForeignKey(t => t.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);

        
            entity.HasIndex(t => new { t.Cijena, t.IdKorisnik });
        });

 
        modelBuilder.Entity<Rezervacija>(entity =>
        {
            entity.HasOne(r => r.Termin)
                .WithMany(t => t.Rezervacije)
                .HasForeignKey(r => r.IdTermin)
                .OnDelete(DeleteBehavior.Cascade);
        });

  
        modelBuilder.Entity<Placanje>(entity =>
        {
            entity.HasOne(p => p.Rezervacija)
                .WithMany(r => r.Placanja)
                .HasForeignKey(p => p.IdRezervacija)
                .OnDelete(DeleteBehavior.Cascade);
        });

     
        modelBuilder.Entity<Recenzija>(entity =>
        {
            entity.HasOne(r => r.Rezervacija)
                .WithMany(rez => rez.Recenzije)
                .HasForeignKey(r => r.IdRezervacija)
                .OnDelete(DeleteBehavior.Cascade);

            
            entity.HasIndex(r => new { r.Ocjena, r.IdRezervacija });
        });

        modelBuilder.Entity<Poruka>(entity =>
        {
            entity.HasOne(p => p.Korisnik)
                .WithMany(k => k.Poruke)
                .HasForeignKey(p => p.IdKorisnik)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Rezervacija)
                .WithMany(r => r.Poruke)
                .HasForeignKey(p => p.IdRezervacija)
                .OnDelete(DeleteBehavior.Cascade);
        });


        modelBuilder.Entity<RezervacijaPas>(entity =>
        {
            entity.HasKey(rp => new { rp.IdRezervacija, rp.IdPas });

            entity.HasOne(rp => rp.Rezervacija)
                .WithMany(r => r.PsiRezervacije)
                .HasForeignKey(rp => rp.IdRezervacija)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rp => rp.Pas)
                .WithMany(p => p.RezervacijePsa)
                .HasForeignKey(rp => rp.IdPas)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

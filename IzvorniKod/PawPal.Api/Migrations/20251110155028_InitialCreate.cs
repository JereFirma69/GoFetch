using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Korisnici",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmailKorisnik = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LozinkaHashKorisnik = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AuthProvider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ProviderUserId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Ime = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Prezime = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Korisnici", x => x.IdKorisnik);
                });

            migrationBuilder.CreateTable(
                name: "Administratori",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Administratori", x => x.IdKorisnik);
                    table.ForeignKey(
                        name: "FK_Administratori_Korisnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Korisnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Setaci",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false),
                    ImeSetac = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PrezimeSetac = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProfilnaSetac = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LokacijaSetac = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TelefonSetac = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Setaci", x => x.IdKorisnik);
                    table.ForeignKey(
                        name: "FK_Setaci_Korisnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Korisnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vlasnici",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vlasnici", x => x.IdKorisnik);
                    table.ForeignKey(
                        name: "FK_Vlasnici_Korisnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Korisnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Clanarine",
                columns: table => new
                {
                    IdClanarina = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VrstaClanarina = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DatumPocetkaClanarina = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DatumIstekaClanarina = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StatusClanarina = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clanarine", x => x.IdClanarina);
                    table.ForeignKey(
                        name: "FK_Clanarine_Setaci_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Setaci",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Termini",
                columns: table => new
                {
                    IdTermin = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VrstaSetnjaTermin = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Cijena = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Trajanje = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DatumVrijemePocetka = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LokacijaTermin = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Termini", x => x.IdTermin);
                    table.ForeignKey(
                        name: "FK_Termini_Setaci_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Setaci",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pretplate",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pretplate", x => x.IdKorisnik);
                    table.ForeignKey(
                        name: "FK_Pretplate_Vlasnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Vlasnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Psi",
                columns: table => new
                {
                    IdPas = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ImePas = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Poslastice = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Socijalizacija = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RazinaEnergije = table.Column<int>(type: "integer", nullable: false),
                    ZdravstveneNapomene = table.Column<string>(type: "text", nullable: true),
                    Starost = table.Column<int>(type: "integer", nullable: false),
                    Pasmina = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProfilnaPas = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Psi", x => x.IdPas);
                    table.ForeignKey(
                        name: "FK_Psi_Vlasnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Vlasnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Rezervacije",
                columns: table => new
                {
                    IdRezervacija = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DatumRezervacija = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StatusRezervacija = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NapomenaRezervacija = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AdresaPolaska = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    VrstaSetnjaRezervacija = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DatumVrijemePolaska = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IdTermin = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rezervacije", x => x.IdRezervacija);
                    table.ForeignKey(
                        name: "FK_Rezervacije_Termini_IdTermin",
                        column: x => x.IdTermin,
                        principalTable: "Termini",
                        principalColumn: "IdTermin",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Placanja",
                columns: table => new
                {
                    IdPlacanje = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StatusPlacanje = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DatumPlacanje = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IznosPlacanje = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    NacinPlacanje = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IdRezervacija = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Placanja", x => x.IdPlacanje);
                    table.ForeignKey(
                        name: "FK_Placanja_Rezervacije_IdRezervacija",
                        column: x => x.IdRezervacija,
                        principalTable: "Rezervacije",
                        principalColumn: "IdRezervacija",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Poruke",
                columns: table => new
                {
                    IdPoruka = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TekstPoruka = table.Column<string>(type: "text", nullable: true),
                    DatumVrijemePoruka = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FotografijaPoruka = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false),
                    IdRezervacija = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Poruke", x => x.IdPoruka);
                    table.ForeignKey(
                        name: "FK_Poruke_Korisnici_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Korisnici",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Poruke_Rezervacije_IdRezervacija",
                        column: x => x.IdRezervacija,
                        principalTable: "Rezervacije",
                        principalColumn: "IdRezervacija",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Recenzije",
                columns: table => new
                {
                    IdRecenzija = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DatumRecenzija = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Ocjena = table.Column<int>(type: "integer", nullable: false),
                    Komentar = table.Column<string>(type: "text", nullable: true),
                    FotografijaRecenzija = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IdRezervacija = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recenzije", x => x.IdRecenzija);
                    table.ForeignKey(
                        name: "FK_Recenzije_Rezervacije_IdRezervacija",
                        column: x => x.IdRezervacija,
                        principalTable: "Rezervacije",
                        principalColumn: "IdRezervacija",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RezervacijePsi",
                columns: table => new
                {
                    IdRezervacija = table.Column<int>(type: "integer", nullable: false),
                    IdPas = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RezervacijePsi", x => new { x.IdRezervacija, x.IdPas });
                    table.ForeignKey(
                        name: "FK_RezervacijePsi_Psi_IdPas",
                        column: x => x.IdPas,
                        principalTable: "Psi",
                        principalColumn: "IdPas",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RezervacijePsi_Rezervacije_IdRezervacija",
                        column: x => x.IdRezervacija,
                        principalTable: "Rezervacije",
                        principalColumn: "IdRezervacija",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clanarine_IdKorisnik",
                table: "Clanarine",
                column: "IdKorisnik");

            migrationBuilder.CreateIndex(
                name: "IX_Korisnici_EmailKorisnik",
                table: "Korisnici",
                column: "EmailKorisnik",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Placanja_IdRezervacija",
                table: "Placanja",
                column: "IdRezervacija");

            migrationBuilder.CreateIndex(
                name: "IX_Poruke_IdKorisnik",
                table: "Poruke",
                column: "IdKorisnik");

            migrationBuilder.CreateIndex(
                name: "IX_Poruke_IdRezervacija",
                table: "Poruke",
                column: "IdRezervacija");

            migrationBuilder.CreateIndex(
                name: "IX_Psi_IdKorisnik",
                table: "Psi",
                column: "IdKorisnik");

            migrationBuilder.CreateIndex(
                name: "IX_Recenzije_IdRezervacija",
                table: "Recenzije",
                column: "IdRezervacija");

            migrationBuilder.CreateIndex(
                name: "IX_Recenzije_Ocjena_IdRezervacija",
                table: "Recenzije",
                columns: new[] { "Ocjena", "IdRezervacija" });

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_IdTermin",
                table: "Rezervacije",
                column: "IdTermin");

            migrationBuilder.CreateIndex(
                name: "IX_RezervacijePsi_IdPas",
                table: "RezervacijePsi",
                column: "IdPas");

            migrationBuilder.CreateIndex(
                name: "IX_Setaci_LokacijaSetac",
                table: "Setaci",
                column: "LokacijaSetac");

            migrationBuilder.CreateIndex(
                name: "IX_Termini_Cijena_IdKorisnik",
                table: "Termini",
                columns: new[] { "Cijena", "IdKorisnik" });

            migrationBuilder.CreateIndex(
                name: "IX_Termini_IdKorisnik",
                table: "Termini",
                column: "IdKorisnik");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Administratori");

            migrationBuilder.DropTable(
                name: "Clanarine");

            migrationBuilder.DropTable(
                name: "Placanja");

            migrationBuilder.DropTable(
                name: "Poruke");

            migrationBuilder.DropTable(
                name: "Pretplate");

            migrationBuilder.DropTable(
                name: "Recenzije");

            migrationBuilder.DropTable(
                name: "RezervacijePsi");

            migrationBuilder.DropTable(
                name: "Psi");

            migrationBuilder.DropTable(
                name: "Rezervacije");

            migrationBuilder.DropTable(
                name: "Vlasnici");

            migrationBuilder.DropTable(
                name: "Termini");

            migrationBuilder.DropTable(
                name: "Setaci");

            migrationBuilder.DropTable(
                name: "Korisnici");
        }
    }
}

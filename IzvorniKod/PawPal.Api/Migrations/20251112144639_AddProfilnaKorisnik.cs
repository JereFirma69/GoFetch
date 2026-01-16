using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfilnaKorisnik : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilnaKorisnik",
                table: "Korisnici",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilnaKorisnik",
                table: "Korisnici");
        }
    }
}

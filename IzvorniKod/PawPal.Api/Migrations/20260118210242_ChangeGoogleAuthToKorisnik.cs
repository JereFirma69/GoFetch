using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeGoogleAuthToKorisnik : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WalkerGoogleAuths_Setaci_IdKorisnik",
                table: "WalkerGoogleAuths");

            migrationBuilder.AddForeignKey(
                name: "FK_WalkerGoogleAuths_Korisnici_IdKorisnik",
                table: "WalkerGoogleAuths",
                column: "IdKorisnik",
                principalTable: "Korisnici",
                principalColumn: "IdKorisnik",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WalkerGoogleAuths_Korisnici_IdKorisnik",
                table: "WalkerGoogleAuths");

            migrationBuilder.AddForeignKey(
                name: "FK_WalkerGoogleAuths_Setaci_IdKorisnik",
                table: "WalkerGoogleAuths",
                column: "IdKorisnik",
                principalTable: "Setaci",
                principalColumn: "IdKorisnik",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCalendarFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarEventId",
                table: "Termini",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxDogs",
                table: "Termini",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdVlasnik",
                table: "Rezervacije",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "WalkerGoogleAuths",
                columns: table => new
                {
                    IdKorisnik = table.Column<int>(type: "integer", nullable: false),
                    AccessToken = table.Column<string>(type: "text", nullable: false),
                    RefreshToken = table.Column<string>(type: "text", nullable: false),
                    TokenExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CalendarId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalkerGoogleAuths", x => x.IdKorisnik);
                    table.ForeignKey(
                        name: "FK_WalkerGoogleAuths_Setaci_IdKorisnik",
                        column: x => x.IdKorisnik,
                        principalTable: "Setaci",
                        principalColumn: "IdKorisnik",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rezervacije_IdVlasnik",
                table: "Rezervacije",
                column: "IdVlasnik");

            migrationBuilder.AddForeignKey(
                name: "FK_Rezervacije_Vlasnici_IdVlasnik",
                table: "Rezervacije",
                column: "IdVlasnik",
                principalTable: "Vlasnici",
                principalColumn: "IdKorisnik",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rezervacije_Vlasnici_IdVlasnik",
                table: "Rezervacije");

            migrationBuilder.DropTable(
                name: "WalkerGoogleAuths");

            migrationBuilder.DropIndex(
                name: "IX_Rezervacije_IdVlasnik",
                table: "Rezervacije");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarEventId",
                table: "Termini");

            migrationBuilder.DropColumn(
                name: "MaxDogs",
                table: "Termini");

            migrationBuilder.DropColumn(
                name: "IdVlasnik",
                table: "Rezervacije");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWalkerBio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Setaci",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Setaci");
        }
    }
}

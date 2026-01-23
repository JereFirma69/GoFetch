using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PawPal.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMembershipSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StreamUserId",
                table: "Korisnici",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MembershipSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MonthlyPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    YearlyPrice = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MembershipSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "MembershipSettings",
                columns: new[] { "Id", "Currency", "MonthlyPrice", "YearlyPrice" },
                values: new object[] { 1, "EUR", 0m, 0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MembershipSettings");

            migrationBuilder.DropColumn(
                name: "StreamUserId",
                table: "Korisnici");
        }
    }
}

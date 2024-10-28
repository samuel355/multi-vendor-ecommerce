import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "clerkId",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "firstName",
            type: "varchar",
          },
          {
            name: "lastName",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "role",
            type: "enum",
            enum: ["user", "vendor", "admin"],
            default: "'user'",
          },
          {
            name: "avatarUrl",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "phoneNumber",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "isActive",
            type: "boolean",
            default: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    // Create indexes using TableIndex
    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USERS_CLERK_ID",
        columnNames: ["clerkId"],
        isUnique: true
      })
    );

    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USERS_EMAIL",
        columnNames: ["email"],
        isUnique: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex("users", "IDX_USERS_CLERK_ID");
    await queryRunner.dropIndex("users", "IDX_USERS_EMAIL");
    
    // Then drop the table
    await queryRunner.dropTable("users");
  }
}
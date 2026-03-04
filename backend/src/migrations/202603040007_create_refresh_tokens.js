exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("refresh_tokens");
  if (!exists) {
    await knex.schema.createTable("refresh_tokens", (table) => {
      table.bigIncrements("id").primary();
      table
        .integer("user_id")
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.string("token_hash", 255).notNullable();
      table.timestamp("expires_at").notNullable();
      table.timestamp("revoked_at").nullable();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.index(["user_id", "token_hash"]);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("refresh_tokens");
};

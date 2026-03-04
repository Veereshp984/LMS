exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable("videos");
  if (!exists) {
    await knex.schema.createTable("videos", (table) => {
      table.bigIncrements("id").primary();
      table
        .bigInteger("section_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("sections")
        .onDelete("CASCADE");
      table.string("title", 255).notNullable();
      table.text("description").nullable();
      table.string("youtube_url", 500).notNullable();
      table.integer("order_index").notNullable();
      table.integer("duration_seconds").nullable();
      table.timestamps(true, true);
      table.unique(["section_id", "order_index"]);
      table.index(["section_id", "order_index"]);
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("videos");
};

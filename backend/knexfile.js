const env = require("./src/config/env");

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      ssl: env.DB_SSL ? { rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED } : undefined,
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
    },
  },
};

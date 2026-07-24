const db = require("../config/db");

const columnExistsCache = new Map();

async function hasColumn(tableName, columnName) {
  const key = `${tableName}:${columnName}`;
  if (!columnExistsCache.has(key)) {
    columnExistsCache.set(key, db.schema.hasColumn(tableName, columnName));
  }
  return columnExistsCache.get(key);
}

module.exports = { hasColumn };

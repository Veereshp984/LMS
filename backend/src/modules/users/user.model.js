const db = require("../../config/db");

async function getUsersColumnInfo() {
  return db("users").columnInfo();
}

function findByEmail(email) {
  return db("users").where({ email }).first();
}

function findById(id) {
  return db("users").where({ id }).first();
}

async function createUser({ email, password_hash, name }) {
  const columns = await getUsersColumnInfo();
  const payload = { email, name };
  if (columns.password_hash) payload.password_hash = password_hash;
  if (columns.password) payload.password = password_hash;
  if (columns.phone) payload.phone = "0000000000";
  if (columns.date_of_birth) payload.date_of_birth = "1970-01-01";
  if (columns.created_at) payload.created_at = new Date();
  if (columns.updated_at) payload.updated_at = new Date();

  const [id] = await db("users").insert(payload);
  return findById(id);
}

module.exports = { findByEmail, findById, createUser, getUsersColumnInfo };

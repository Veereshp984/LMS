function validateRegister(body) {
  const { email, password, name } = body;
  if (!email || !password || !name) {
    return "email, password, and name are required";
  }
  if (String(password).length < 6) {
    return "password must be at least 6 characters";
  }
  return null;
}

function validateLogin(body) {
  const { email, password } = body;
  if (!email || !password) {
    return "email and password are required";
  }
  return null;
}

module.exports = { validateRegister, validateLogin };

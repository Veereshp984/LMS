import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../lib/auth";
import AppShell from "../components/Layout/AppShell";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register({ name, email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Start learning in minutes.</p>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" className="w-full">
            Create account
          </Button>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-slate-900 underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}

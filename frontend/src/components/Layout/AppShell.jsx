import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { logout } from "../../lib/auth";
import NavbarChatbot from "./NavbarChatbot";

export default function AppShell({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="brand-gradient h-1 w-full" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-[#0a4dcf]">
            LearnSphere
          </Link>
          <div className="flex items-center gap-5">
            <NavbarChatbot />
            {isAuthenticated ? (
              <>
                <Link to="/my-courses" className="text-sm font-medium text-slate-700">
                  My Courses
                </Link>
                <Link to="/profile" className="text-sm font-medium text-slate-700">
                  {user?.name || "Profile"}
                </Link>
                <button className="text-sm font-medium text-slate-700" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-medium text-slate-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { useAuth } from "../context/authContextBase";
import { Navigate, useLocation } from "react-router-dom";

const getDefaultPathForUser = (user) => {
  if (!user) return "/login";

  if (user.role === "Student") return "/moas";
  return "/dashboard";
};

const isPathAllowedForUser = (user, path) => {
  if (!user) return false;
  if (!path || typeof path !== "string") return false;
  if (path.startsWith("/login")) return false;

  if (user.role === "Admin") return true;

  const allowedPrefixes = ["/dashboard", "/moas"]; // no /users, /audit
  return allowedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

const Login = () => {
  const { user, login, error, loading } = useAuth();
  const location = useLocation();
  const [loginPending, setLoginPending] = useState(false);

  const fromPath = useMemo(() => {
    const from = location.state?.from;
    if (!from || typeof from !== "object") return null;
    const pathname = from.pathname || "";
    const search = from.search || "";
    const hash = from.hash || "";
    const full = `${pathname}${search}${hash}`;
    return full || null;
  }, [location.state]);

  if (user) {
    const fallback = getDefaultPathForUser(user);
    const destination = isPathAllowedForUser(user, fromPath) ? fromPath : fallback;
    return <Navigate to={destination} replace />;
  }

  return (
    <div className="hero-bg flex flex-col text-gray-100 min-h-screen">
      <nav className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://raw.githubusercontent.com/shinramyeon22/Software_Engineering_2_PROJECT/main/NEULogo.jpg" 
            alt="NEU Logo" 
            className="w-10 h-10 rounded-full" />
            <span className="text-2xl font-bold tracking-tight">
              NEU<span className="text-purple-400">MOA</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12 text-center">
        <div className="max-w-5xl">
          <p className="text-purple-300 font-semibold tracking-widest uppercase mb-5 text-lg">
            Trusted University Agreement Management
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 drop-shadow-2xl">
            NEW <span className="text-purple-400">ERA</span> UNIVERSITY
            <br />
            <span className="text-purple-400">MOA</span> Monitoring
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto drop-shadow-lg">
            Efficiently track, manage, and ensure compliance for all Memoranda of Agreements.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 min-h-[180px]">
            {loading || loginPending ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-purple-500 border-opacity-70"></div>
                <p className="text-lg text-purple-200">Verifying your Google account…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={async () => {
                    setLoginPending(true);
                    try {
                      await login();
                    } finally {
                      setLoginPending(false);
                    }
                  }}
                  className="w-80 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-lg shadow-md flex items-center justify-center gap-3 transition-colors"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Sign in with Google
                </button>

                <p className="text-sm text-gray-400 mt-3">Sign in with your @neu.edu.ph Google account</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 mt-4">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

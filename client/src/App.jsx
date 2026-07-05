// client/src/App.jsx
// App shell and session management for the client. Recent changes added session hydration,
// protected-route guards, guest-route redirects, and a shared session context for the app.
import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch, apiRequest } from "./api";

import Feed from "./Feed";
import Explore from "./Explore";
import New from "./New";
import MyPosts from "./MyPosts";
import Liked from "./Liked";
import Profile from "./Profile";
import Login from "./Login";
import Signup from "./signup";
import Unauthorized from "./Unauthorized";
import Sidebar from "./Sidebar";
import Side2 from "./Side2";
import { ThemeProvider, useTheme } from "./ThemeContext";
import IconButton from "./components/IconButton";
import { LogOutIcon, MoonIcon, SunIcon } from "./components/Icons";

export const SessionContext = createContext({
  session: null,
  setSession: () => {},
  followedUsers: [],
  refreshFollowed: async () => {}
});

export function useSession() {
  return useContext(SessionContext);
}

export default function App() {
  const [session, setSession] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [bootstrapped, setBootstrapped] = useState(false);

  async function fetchSession() {
    try {
      const result = await apiRequest("/api/profile/me");
      setSession(result.data?.user || null);
    } catch (e) {
      if (e.status === 401) {
        setSession(null);
      } else {
        console.error("Session fetch error", e);
        setSession(null);
      }
    } finally {
      setBootstrapped(true);
    }
  }

  async function fetchFollowedUsers() {
    try {
      const result = await apiRequest("/api/profile/followed");
      setFollowedUsers(result.data?.followedUsers || []);
    } catch (e) {
      if (e.status === 401) {
        setFollowedUsers([]);
      } else {
        console.error("Followed fetch error", e);
        setFollowedUsers([]);
      }
    }
  }

  async function refreshFollowed() {
    await fetchFollowedUsers();
  }

  useEffect(() => {
    void fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      void fetchFollowedUsers();
    } else {
      setFollowedUsers([]);
    }
  }, [session]);

  if (!bootstrapped) {
    return (
      <div className="app-loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading Niche...</span>
      </div>
    );
  }

  const contextValue = {
    session,
    setSession,
    followedUsers,
    refreshFollowed
  };

  return (
    <ThemeProvider>
      <SessionContext.Provider value={contextValue}>
        <BrowserRouter>
          <AppLayout session={session} bootstrapped={bootstrapped} />
          <MobileTopBar session={session} />
          <MobileBottomNav session={session} />
        </BrowserRouter>
      </SessionContext.Provider>
    </ThemeProvider>
  );
}

function ProtectedRoute({ session, bootstrapped, children }) {
  const location = useLocation();

  if (!bootstrapped) {
    return (
      <div className="app-loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading Niche...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

function GuestRoute({ session, bootstrapped, children }) {
  if (!bootstrapped) {
    return (
      <div className="app-loading">
        <div className="spinner" aria-hidden="true" />
        <span>Loading Niche...</span>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MobileTopBar({ session }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useSession();
  const { isDark, toggleTheme } = useTheme();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/unauthorized";

  if (!session || isAuthPage) return null;

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    navigate("/login");
  }

  return (
    <header className="mobile-top-bar" aria-label="Mobile account actions">
      <span className="mobile-top-bar__user">@{session.username}</span>
      <div className="mobile-top-bar__actions">
        <IconButton
          label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
        <IconButton label="Log out" variant="ghost" size="sm" onClick={handleLogout}>
          <LogOutIcon />
        </IconButton>
      </div>
    </header>
  );
}

function MobileBottomNav({ session }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/unauthorized";
  if (!session || isAuthPage) return null;

  const links = [
    { to: "/", label: "Home", match: (path) => path === "/" },
    { to: "/explore", label: "Explore", match: (path) => path.startsWith("/explore") },
    { to: "/new", label: "Create", match: (path) => path.startsWith("/new") },
    { to: "/liked", label: "Liked", match: (path) => path.startsWith("/liked") },
    { to: "/myposts", label: "Mine", match: (path) => path.startsWith("/myposts") }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {links.map(({ to, label, match }) => (
        <Link
          key={to}
          to={to}
          title={label}
          className={match(location.pathname) ? "active" : ""}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function AppLayout({ session, bootstrapped }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup" || location.pathname === "/unauthorized";

  return (
    <>
      {!isAuthPage && <Sidebar session={session} />}
      {!isAuthPage && <Side2 session={session} />}

      <Routes>
        <Route path="/" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><Feed session={session} /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><Explore session={session} /></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><New session={session} /></ProtectedRoute>} />
        <Route path="/myposts" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><MyPosts session={session} /></ProtectedRoute>} />
        <Route path="/liked" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><Liked session={session} /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute session={session} bootstrapped={bootstrapped}><Profile session={session} /></ProtectedRoute>} />
        <Route path="/login" element={<GuestRoute session={session} bootstrapped={bootstrapped}><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute session={session} bootstrapped={bootstrapped}><Signup /></GuestRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

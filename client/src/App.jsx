// client/src/App.jsx
// Top-level app. Handles session bootstrapping, followed-users, routing,
// and provides a SessionContext so child components can read session without prop-drilling.

import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "./api"; // helper that uses credentials: "include"

// Import your page components. Make sure filenames match these imports:
// Feed.js, Explore.js, New.js, MyPosts.js, Liked.js, Profile.js, Login.js, Signup.js
import Feed from "./Feed";
import Explore from "./Explore";
import New from "./New";
import MyPosts from "./MyPosts";
import Liked from "./Liked";
import Profile from "./Profile";
import Login from "./Login";
import Signup from "./signup";

// Sidebar components stay the same
import Sidebar from "./Sidebar";
import Side2 from "./Side2";

// Create a React context so any component can access session and helpers
export const SessionContext = createContext({
  session: null,
  setSession: () => {},
  followedUsers: [],
  refreshFollowed: async () => {}
});

// small convenience hook to use session inside components
export function useSession() {
  return useContext(SessionContext);
}

// Main App component
export default function App() {
  const [session, setSession] = useState(null); // { id, username } or null
  const [followedUsers, setFollowedUsers] = useState([]); // small list for right sidebar
  const [bootstrapped, setBootstrapped] = useState(false); // show loading until we tried to hydrate session

  // fetch session info from server to know if user is logged in
  async function fetchSession() {
    try {
      const res = await apiFetch("/api/profile/me"); // server should return { user: { id, username } }
      if (res.ok) {
        const j = await res.json();
        setSession(j.user || null);
      } else {
        setSession(null);
      }
    } catch (e) {
      console.error("Session fetch error", e);
      setSession(null);
    } finally {
      setBootstrapped(true);
    }
  }

  // fetch condensed followed-users list used in the sidebar
  async function fetchFollowedUsers() {
    try {
      // Correct endpoint path
      const res = await apiFetch("/api/profile/followed");
      if (res.ok) {
        const j = await res.json(); // { followedUsers: [...] }
        setFollowedUsers(j.followedUsers || []);
        return;
      }
      // fallback: try profile/me in case your backend returns followedUsers there
      const res2 = await apiFetch("/api/profile/me");
      if (res2.ok) {
        const j2 = await res2.json();
        if (j2.followedUsers) setFollowedUsers(j2.followedUsers);
        else setFollowedUsers([]);
      } else {
        setFollowedUsers([]);
      }
    } catch (e) {
      console.error("Followed fetch error", e);
      setFollowedUsers([]);
    }
  }

  // helper exposed via context so children can refresh the followed list
  async function refreshFollowed() {
    await fetchFollowedUsers();
  }

  // bootstrap session on mount
  useEffect(() => {
    (async () => {
      await fetchSession();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // whenever session changes (login or logout), refresh followed users
  useEffect(() => {
    if (session) fetchFollowedUsers();
    else setFollowedUsers([]);
  }, [session]);

  // while we load initial session show a simple loader
  if (!bootstrapped) {
    return <div style={{ padding: 20 }}>Loading app...</div>;
  }

  // context value for children
  const contextValue = {
    session,
    setSession,
    followedUsers,
    refreshFollowed
  };

  return (
    <SessionContext.Provider value={contextValue}>
      <BrowserRouter>
        <AppLayout session={session} />
      </BrowserRouter>
    </SessionContext.Provider>
  );
}

function AppLayout({ session }) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {/* Sidebar components - fixed position handled by CSS */}
      {!isAuthPage && <Sidebar session={session} />}
      {!isAuthPage && <Side2 session={session} />}

      {/* Main content area */}
      <Routes>
        <Route path="/" element={<Feed session={session} />} />
        <Route path="/explore" element={<Explore session={session} />} />
        <Route path="/new" element={<New session={session} />} />
        <Route path="/myposts" element={<MyPosts session={session} />} />
        <Route path="/liked" element={<Liked session={session} />} />
        <Route path="/profile/:username" element={<Profile session={session} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

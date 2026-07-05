// client/src/Sidebar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext";

export default function Sidebar({ session }) {
  const username = session?.username || "";
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  function isActive(path) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="side">
      <h1 className="logo">Niche</h1>

      <ul>
        <li>
          <Link to={`/profile/${username}`} className={isActive(`/profile/${username}`) ? "active" : ""}>
            <img src="/ICONS/profile.png" alt="" /> <span>My Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/" className={isActive("/") && location.pathname === "/" ? "active" : ""}>
            <img src="/ICONS/home.png" alt="" /> <span>Home</span>
          </Link>
        </li>
        <li>
          <Link to="/explore" className={isActive("/explore") ? "active" : ""}>
            <img src="/ICONS/search.png" alt="" /> <span>Explore</span>
          </Link>
        </li>
        <li>
          <Link to="/new" className={isActive("/new") ? "active" : ""}>
            <img src="/ICONS/create.png" alt="" /> <span>Create</span>
          </Link>
        </li>
        <li>
          <Link to="/liked" className={isActive("/liked") ? "active" : ""}>
            <img src="/ICONS/like.png" alt="" /> <span>Liked Posts</span>
          </Link>
        </li>
        <li>
          <Link to="/myposts" className={isActive("/myposts") ? "active" : ""}>
            <img src="/ICONS/profile.png" alt="" /> <span>My Posts</span>
          </Link>
        </li>
      </ul>
      <div className="theme-toggle-wrap">
        <button type="button" className="btn btn-muted" onClick={toggleTheme} style={{ width: "100%" }}>
          {isDark ? "Switch to Light" : "Switch to Dark"}
        </button>
      </div>
    </aside>
  );
}

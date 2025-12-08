// client/src/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({ session }) {
  const username = session?.username || "";

  return (
    <aside className="side">
      <h1 className="logo">Niche</h1>

      <ul>
        <li>
          <Link to={`/profile/${username}`}>
            <img src="/ICONS/profile.png" alt="" /> My Profile
          </Link>
        </li>
        <li>
          <Link to="/">
            <img src="/ICONS/home.png" alt="" /> Home
          </Link>
        </li>
        <li>
          <Link to="/explore">
            <img src="/ICONS/search.png" alt="" /> Explore
          </Link>
        </li>
        <li>
          <Link to="/new">
            <img src="/ICONS/create.png" alt="" /> Create
          </Link>
        </li>
        <li>
          <Link to="/liked">
            <img src="/ICONS/like.png" alt="" /> Liked Posts
          </Link>
        </li>
        <li>
          <Link to="/myposts">
            <img src="/ICONS/profile.png" alt="" /> My Posts
          </Link>
        </li>
      </ul>
    </aside>
  );
}

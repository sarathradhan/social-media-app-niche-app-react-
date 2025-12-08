// client/src/Side2.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "./api";
import { useSession } from "./App";

export default function Side2({ session }) {
  const nav = useNavigate();
  const { setSession, followedUsers = [] } = useSession();
  
  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    nav("/login");
  }
  
  return (
    <div className="side2">
      <div className="sbar">
        <div className="bar"></div>
      </div>

      <div className="login-signup">
        {session && session.username ? (
          <p>Welcome, <strong>{session.username}</strong> | <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a></p>
        ) : (
          <>
            <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
          </>
        )}
      </div>

      <div className="vids">
        <h1>Following</h1>
        {followedUsers.length === 0 ? (
          <p style={{color:"#777", fontSize:".9rem"}}>Follow people to see them here.</p>
        ) : (
          followedUsers.map(u => (
            <div key={u.username} className="vid-row">
              <img src={u.profile_pic_url ? `${API_BASE}${u.profile_pic_url}` : '/default.png'} alt=""/>
              <Link to={`/profile/${u.username}`}>{u.username}</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
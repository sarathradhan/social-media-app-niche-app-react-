// client/src/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { addToast } = useToast();
  const { setSession } = useSession();

  async function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast("Please enter username and password", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user);
        addToast(`Welcome back, ${data.user.username}!`, "success");
        setTimeout(() => nav("/"), 500);
      } else {
        const errData = await res.json();
        addToast(errData.error || "Login failed", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      addToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="middle">
        <div className="image">
          <img src="/roseate-02.jpeg" alt="Decorative" />
        </div>
        <div className="right">
          <h1>Welcome Back</h1>
          <form onSubmit={submit}>
            <div>
              <label>Username:</label>
              <input 
                type="text" 
                name="username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                disabled={loading}
                placeholder="Enter your username"
                required 
              />
            </div>
            <div>
              <label>Password:</label>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                disabled={loading}
                placeholder="Enter your password"
                required 
              />
            </div>
            <input type="submit" value={loading ? "Logging in..." : "Login"} disabled={loading} />
          </form>

          <div className="line"></div>
          <h1 style={{fontSize:"10px"}}>Or</h1>
          <div className="socials">
            <a href={`${API_BASE}/api/auth/google`}><img src="/ICONS/google.png" alt="Google Login"/></a>
            <a href="#"><img src="/ICONS/apple.png" alt="Apple Login"/></a>
            <a href="#"><img src="/ICONS/twitter.png" alt="Twitter Login"/></a>
          </div>
          <h1 style={{fontSize:"10px", color:"rgb(138,138,138)"}}>Don't have an account yet? <span><a href="/signup" style={{color:"rgb(138,138,138)"}}>Sign Up</a></span></h1>
        </div>
      </div>
    </div>
  );
}

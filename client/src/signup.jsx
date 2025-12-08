// client/src/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { addToast } = useToast();
  const { setSession } = useSession();

  async function submit(e) {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      addToast("Please fill in all fields", "warning");
      return;
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "warning");
      return;
    }

    if (password.length < 6) {
      addToast("Password must be at least 6 characters", "warning");
      return;
    }

    if (username.length < 3) {
      addToast("Username must be at least 3 characters", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.user);
        addToast(`Welcome to Niche, ${data.user.username}!`, "success");
        setTimeout(() => nav("/"), 500);
      } else {
        const errData = await res.json();
        addToast(errData.error || "Signup failed", "error");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
          <h1>Welcome to Niche</h1>
          <form onSubmit={submit}>
            <label>Username or E-mail</label><br/>
            <input 
              type="text" 
              name="username" 
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              disabled={loading}
              required 
            /><br/>
            <label>Password:</label><br/>
            <input 
              type="password" 
              name="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              disabled={loading}
              required 
            /><br/>
            <label>Confirm Your Password:</label><br/>
            <input 
              type="password" 
              name="confirm" 
              value={confirmPassword} 
              onChange={e=>setConfirmPassword(e.target.value)} 
              disabled={loading}
              required 
            /><br/>
            <input type="submit" value={loading ? "Creating account..." : "Sign Up"} style={{marginLeft:"50%", transform:"translateX(-50%)"}} disabled={loading}/>
          </form>

          <div className="line"></div>
          <h1 style={{fontSize:"10px"}}>Or</h1>
          <div className="socials">
            <a href={`${API_BASE}/api/auth/google`}><img src="/ICONS/google.png" alt="Google Signup"/></a>
            <a href="#"><img src="/ICONS/apple.png" alt="Apple Signup"/></a>
            <a href="#"><img src="/ICONS/twitter.png" alt="Twitter Signup"/></a>
          </div>
          <h1 style={{fontSize:"10px", color:"rgb(138,138,138)"}}>Already have an account? <span><a href="/login" style={{color:"rgb(138,138,138)"}}>Sign In</a></span></h1>
        </div>
      </div>
    </div>
  );
}

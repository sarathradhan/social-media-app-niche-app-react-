// Login screen with improved validation and redirect handling. Recent changes add trimmed input handling,
// inline field errors, loading state feedback, toast-based failures, and redirect preservation.
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE, apiRequest, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { session, setSession } = useSession();
  const redirectTo = new URLSearchParams(location.search).get("next") || "/";

  useEffect(() => {
    if (session) nav(redirectTo, { replace: true });
  }, [nav, redirectTo, session]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const nextErrors = {};

    if (!trimmedUsername) nextErrors.username = "Username is required.";
    if (!trimmedPassword) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
      });
      setSession(data.user);
      addToast(`Welcome back, ${data.user.username}!`, "success");
      nav(redirectTo, { replace: true });
    } catch (error) {
      const message = getApiErrorMessage(error, "Login failed");
      addToast(message, "error");
      if (error.status === 401) {
        setSession(null);
      }
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
          <p className="auth-subtitle">Sign in to continue sharing with your niche</p>
          <form onSubmit={submit} noValidate>
            <div>
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                }}
                disabled={loading}
                placeholder="Enter your username"
              />
              {errors.username ? <div className="field-error">{errors.username}</div> : null}
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                disabled={loading}
                placeholder="Enter your password"
              />
              {errors.password ? <div className="field-error">{errors.password}</div> : null}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="line"></div>
          <span className="auth-or">Or</span>
          <div className="socials">
            <a href={`${API_BASE}/api/auth/google`}><img src="/ICONS/google.png" alt="Google Login" /></a>
            <a href="#"><img src="/ICONS/apple.png" alt="Apple Login" /></a>
            <a href="#"><img src="/ICONS/twitter.png" alt="Twitter Login" /></a>
          </div>
          <p className="auth-footer">Don't have an account yet? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
}

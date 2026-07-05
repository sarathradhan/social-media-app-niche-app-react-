// Signup screen with stronger client-side validation. Recent changes add trimmed field handling,
// password confirmation checks, loading-state protection, and clearer toast feedback.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, apiRequest, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  const { addToast } = useToast();
  const { session, setSession } = useSession();

  useEffect(() => {
    if (session) nav("/", { replace: true });
  }, [nav, session]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    const nextErrors = {};

    if (!trimmedUsername) nextErrors.username = "Username is required.";
    if (trimmedUsername.length < 3) nextErrors.username = "Username must be at least 3 characters.";
    if (!trimmedPassword) nextErrors.password = "Password is required.";
    if (trimmedPassword.length < 6) nextErrors.password = "Password must be at least 6 characters.";
    if (!trimmedConfirm) nextErrors.confirm = "Please confirm your password.";
    if (trimmedPassword && trimmedConfirm && trimmedPassword !== trimmedConfirm) nextErrors.confirm = "Passwords do not match.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const { data } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword })
      });
      setSession(data.user);
      addToast(`Welcome to Niche, ${data.user.username}!`, "success");
      nav("/", { replace: true });
    } catch (error) {
      addToast(getApiErrorMessage(error, "Signup failed"), "error");
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
          <p className="auth-subtitle">Create your account and join the community</p>
          <form className="signup-form" onSubmit={submit} noValidate>
            <div>
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                }}
                disabled={loading}
                placeholder="Pick a username"
                autoComplete="username"
              />
              {errors.username ? <div className="field-error">{errors.username}</div> : null}
            </div>
            <div>
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                disabled={loading}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {errors.password ? <div className="field-error">{errors.password}</div> : null}
            </div>
            <div>
              <label htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirm"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: "" }));
                }}
                disabled={loading}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {errors.confirm ? <div className="field-error">{errors.confirm}</div> : null}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="line"></div>
          <span className="auth-or">Or</span>
          <div className="socials">
            <a href={`${API_BASE}/api/auth/google`}><img src="/ICONS/google.png" alt="Google Signup" /></a>
            <a href="#"><img src="/ICONS/apple.png" alt="Apple Signup" /></a>
            <a href="#"><img src="/ICONS/twitter.png" alt="Twitter Signup" /></a>
          </div>
          <p className="auth-footer">Already have an account? <a href="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Unauthorized() {
  const location = useLocation();
  const next = location.pathname;

  return (
    <main className="main-rail page-center">
      <div className="state-panel">
        <h1>Access restricted</h1>
        <p>You need to be signed in to view this page.</p>
        <Link to={`/login?next=${encodeURIComponent(next)}`}>
          <button type="button" className="btn btn-primary">Go to Login</button>
        </Link>
      </div>
    </main>
  );
}

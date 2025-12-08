// client/src/ExploreExact.js
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "./api";
import { Link } from "react-router-dom";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Explore({ session }) {
  const [users, setUsers] = useState([]);
  const { addToast } = useToast();
  const { refreshFollowed } = useSession();

  useEffect(()=>{ (async ()=>{
    const res = await apiFetch("/api/profile/explore");
    if (res.ok) setUsers((await res.json()).users || []);
  })(); }, []);

  async function follow(username) {
    const res = await apiFetch(`/api/profile/follow/${username}`, { method: "POST" });
    if (res.ok) {
      setUsers(u => u.map(x => x.username === username ? { ...x, is_following: true } : x));
      addToast(`Now following ${username}`, "success");
      refreshFollowed();
    } else {
      const err = await res.json().catch(() => ({}));
      addToast(err.error || "Failed to follow user", "error");
    }
  }
  async function unfollow(username) {
    const res = await apiFetch(`/api/profile/unfollow/${username}`, { method: "POST" });
    if (res.ok) {
      setUsers(u => u.map(x => x.username === username ? { ...x, is_following: false } : x));
      addToast(`Unfollowed ${username}`, "success");
      refreshFollowed();
    } else {
      const err = await res.json().catch(() => ({}));
      addToast(err.error || "Failed to unfollow user", "error");
    }
  }

  return (
    <main className="explore-main">
      <h1>Explore People</h1>
      <div className="people-grid">
        {users.map(u => (
          <div className="person-card" key={u.username}>
            <Link to={`/profile/${u.username}`}>
              <img src={u.profile_pic_url ? `${API_BASE}${u.profile_pic_url}` : '/default.png'} alt="avatar" loading="lazy" />
            </Link>
            <h3><Link to={`/profile/${u.username}`}>{u.username}</Link></h3>

            {u.is_following ? (
              <button className="unfollow" onClick={()=>unfollow(u.username)}>Unfollow</button>
            ) : (
              <button onClick={()=>follow(u.username)}>Follow</button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

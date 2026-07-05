// Explore users page. Recent changes add loading, empty, and error states plus clearer follow/unfollow feedback.
import React, { useEffect, useState } from "react";
import { apiFetch, apiRequest, API_BASE, getApiErrorMessage } from "./api";
import { Link } from "react-router-dom";
import { useToast } from "./Toast";
import { useSession } from "./App";
import { EmptyState, ErrorState, LoadingState } from "./StatePanel";
import SearchBar from "./SearchBar";
import useDebouncedValue from "./useDebouncedValue";
import IconButton from "./components/IconButton";
import { UserMinusIcon, UserPlusIcon } from "./components/Icons";

export default function Explore({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const { addToast } = useToast();
  const { refreshFollowed } = useSession();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/profile/explore");
      if (!res.ok) throw new Error("Failed to load explore users");
      setUsers((await res.json()).users || []);
    } catch (error) {
      const message = getApiErrorMessage({ message: error.message }, "Unable to load explore suggestions");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers() {
    if (!debouncedQuery.trim()) {
      setSearching(false);
      load();
      return;
    }

    setSearching(true);
    setError("");
    try {
      const { data } = await apiRequest(`/api/profile/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
      setUsers(data.users || []);
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to search users");
      setError(message);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { searchUsers(); }, [debouncedQuery]);

  async function follow(username) {
    try {
      const res = await apiFetch(`/api/profile/follow/${username}`, { method: "POST" });
      if (res.ok) {
        setUsers((u) => u.map((x) => x.username === username ? { ...x, is_following: true } : x));
        addToast(`Now following ${username}`, "success");
        refreshFollowed();
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Failed to follow user", "error");
      }
    } catch (error) {
      addToast("Network error while following user", "error");
    }
  }

  async function unfollow(username) {
    try {
      const res = await apiFetch(`/api/profile/unfollow/${username}`, { method: "POST" });
      if (res.ok) {
        setUsers((u) => u.map((x) => x.username === username ? { ...x, is_following: false } : x));
        addToast(`Unfollowed ${username}`, "success");
        refreshFollowed();
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Failed to unfollow user", "error");
      }
    } catch (error) {
      addToast("Network error while unfollowing user", "error");
    }
  }

  if (loading) return <main className="explore-main"><LoadingState label="Loading explore suggestions..." /></main>;

  return (
    <main className="explore-main">
      <h1>Explore People</h1>
      <SearchBar value={query} onChange={setQuery} placeholder="Search users by username" />
      {searching && !error ? <div className="text-muted" style={{ marginBottom: 12 }}>Searching...</div> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!error && users.length === 0 ? <EmptyState title="No users found" message={debouncedQuery ? "Try a different username." : "There are no more people to discover right now."} /> : null}
      <div className="people-grid">
        {users.map((u) => (
          <div className="person-card" key={u.username}>
            <Link to={`/profile/${u.username}`}>
              <img src={u.profile_pic_url ? `${API_BASE}${u.profile_pic_url}` : "/default.png"} alt="avatar" loading="lazy" />
            </Link>
            <h3><Link to={`/profile/${u.username}`}>{u.username}</Link></h3>

            {u.is_following ? (
              <IconButton label={`Unfollow ${u.username}`} variant="ghost" size="sm" onClick={() => unfollow(u.username)}>
                <UserMinusIcon />
              </IconButton>
            ) : (
              <IconButton label={`Follow ${u.username}`} variant="primary" size="sm" onClick={() => follow(u.username)}>
                <UserPlusIcon />
              </IconButton>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

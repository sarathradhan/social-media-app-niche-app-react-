// client/src/Profile.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, API_BASE } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";

export default function Profile({ session }) {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { addToast } = useToast();
  const { refreshFollowed } = useSession();

  useEffect(() => { (async () => {
    const res = await apiFetch(`/api/profile/${username}`);
    if (res.ok) setData(await res.json());
    else setData({ error: "Failed to load profile" });
  })(); }, [username]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const fd = new FormData(e.target);
    try {
      const res = await apiFetch("/api/profile", { method: "PUT", body: fd });
      if (res.ok) {
        setShowEdit(false);
        const r2 = await apiFetch(`/api/profile/${username}`);
        if (r2.ok) {
          setData(await r2.json());
          addToast("Profile updated successfully!", "success");
        }
      } else {
        const errorData = await res.json();
        addToast(errorData.error || "Failed to save profile", "error");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      addToast("Network error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    const res = await apiFetch(`/api/profile/follow/${username}`, { method: "POST" });
    if (res.ok) {
      addToast(`Now following ${username}`, "success");
      refreshFollowed();
      // Reload profile data
      const r2 = await apiFetch(`/api/profile/${username}`);
      if (r2.ok) setData(await r2.json());
    } else {
      const err = await res.json().catch(() => ({}));
      addToast(err.error || "Failed to follow user", "error");
    }
  };

  const handleUnfollow = async () => {
    const res = await apiFetch(`/api/profile/unfollow/${username}`, { method: "POST" });
    if (res.ok) {
      addToast(`Unfollowed ${username}`, "success");
      refreshFollowed();
      // Reload profile data
      const r2 = await apiFetch(`/api/profile/${username}`);
      if (r2.ok) setData(await r2.json());
    } else {
      const err = await res.json().catch(() => ({}));
      addToast(err.error || "Failed to unfollow user", "error");
    }
  };

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  const { user, posts, isOwner, isFollowing, followerCount, followingCount } = data;

  return (
    <main className="profile-main">
      <div className="profile-container">
        <section className="profile-left">
          <section className="profile-wrap">
            <img 
              src={user.profile_pic_url ? `${API_BASE}${user.profile_pic_url}` : '/default.png'} 
              alt="avatar" 
              className="avatar" 
            />
            <div className="meta">
              <h2>{user.username}</h2>
              <div className="stats">
                <span>{posts.length} posts</span>
                <span>{followerCount} followers</span>
                <span>{followingCount} following</span>
              </div>
              {user.bio ? <p className="bio" id="bio-text">{user.bio}</p> :
                isOwner ? <p className="bio" id="bio-text" style={{fontStyle:"italic", color:"#777"}}>Add a bio…</p> : null}

              {isOwner ? (
                <button className="edit-toggle" onClick={() => setShowEdit(s => !s)}>
                  {showEdit ? "Cancel" : "Edit profile"}
                </button>
              ) : (
                isFollowing ? (
                  <button className="unfollow-btn" onClick={handleUnfollow}>Unfollow</button>
                ) : (
                  <button className="follow-btn" onClick={handleFollow}>Follow</button>
                )
              )}

              {isOwner && showEdit && (
                <form className="edit-form" encType="multipart/form-data" onSubmit={handleProfileUpdate}>
                  <div className="form-group">
                    <label><strong>Change Avatar</strong></label>
                    <input 
                      type="file" 
                      name="avatar" 
                      accept="image/*"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><strong>Edit Bio</strong></label>
                    <textarea name="bio" defaultValue={user.bio || ''} placeholder="Tell us about yourself..." disabled={loading} rows="4"></textarea>
                  </div>
                  
                  <div className="form-buttons">
                    <button type="submit" disabled={loading} className="save-btn">{loading ? "Saving..." : "Save Changes"}</button>
                    <button type="button" onClick={() => setShowEdit(false)} disabled={loading} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </section>

        <section className="profile-right">
          {posts.length === 0 ? (
            <p style={{textAlign: 'center', color:"#777", marginTop: 20}}>No posts yet</p>
          ) : (
            <div className="grid">
              {posts.map(p => (
                <div key={p.id} className="grid-item" onClick={() => setSelectedPost(p)}>
                  {p.image_url ? (
                    <>
                      <img src={`${API_BASE}${p.image_url}`} alt="post" />
                      <div className="overlay">
                        <div className="overlay-text">View Post</div>
                      </div>
                    </>
                  ) : (
                    <div style={{aspectRatio: '1/1', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)'}}>
                      <p style={{textAlign: 'center', padding: '10px'}}>{p.caption?.substring(0, 50)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPost(null)}>×</button>
            <div className="modal-body">
              {selectedPost.image_url && <img src={`${API_BASE}${selectedPost.image_url}`} alt="post" className="modal-image" />}
              <div className="modal-text">
                <p className="modal-caption">{selectedPost.caption}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

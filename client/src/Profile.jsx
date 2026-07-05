// Profile page and profile editing flow. Recent changes add loading states, avatar validation,
// clearer follow actions, and better edit-form handling for a smoother profile experience.
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, API_BASE, getApiErrorMessage } from "./api";
import { useToast } from "./Toast";
import { useSession } from "./App";
import { EmptyState, ErrorState, LoadingState } from "./StatePanel";
import { validateImageFile } from "./utils/imageValidation";
import IconButton from "./components/IconButton";
import { CheckIcon, CloseIcon, EditIcon, UserMinusIcon, UserPlusIcon } from "./components/Icons";
import PostPreviewModal from "./PostPreviewModal";

export default function Profile({ session }) {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const { addToast } = useToast();
  const { refreshFollowed } = useSession();

  async function loadProfile() {
    setProfileLoading(true);
    try {
      const res = await apiFetch(`/api/profile/${username}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        setData({ error: "Failed to load profile" });
      }
    } catch (error) {
      setData({ error: "Failed to load profile" });
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, [username]);

  function handlePostUpdate(updatedPost) {
    setData((prev) => {
      if (!prev?.posts) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
      };
    });
    setSelectedPost((prev) => (prev?.id === updatedPost.id ? { ...prev, ...updatedPost } : prev));
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAvatarError("");

    const fd = new FormData(e.target);
    const avatar = fd.get("avatar");
    if (avatar instanceof File && avatar.name) {
      const validation = validateImageFile(avatar);
      if (!validation.valid) {
        setAvatarError(validation.message);
        setLoading(false);
        return;
      }
    }

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
        addToast(errorData.message || errorData.error || "Failed to save profile", "error");
      }
    } catch (err) {
      addToast("Network error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await apiFetch(`/api/profile/follow/${username}`, { method: "POST" });
      if (res.ok) {
        addToast(`Now following ${username}`, "success");
        refreshFollowed();
        const r2 = await apiFetch(`/api/profile/${username}`);
        if (r2.ok) setData(await r2.json());
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Failed to follow user", "error");
      }
    } catch (error) {
      addToast("Network error while following user", "error");
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await apiFetch(`/api/profile/unfollow/${username}`, { method: "POST" });
      if (res.ok) {
        addToast(`Unfollowed ${username}`, "success");
        refreshFollowed();
        const r2 = await apiFetch(`/api/profile/${username}`);
        if (r2.ok) setData(await r2.json());
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || err.error || "Failed to unfollow user", "error");
      }
    } catch (error) {
      addToast("Network error while unfollowing user", "error");
    }
  };

  if (profileLoading) return <main className="profile-main"><LoadingState label="Loading profile..." /></main>;
  if (data?.error) return <main className="profile-main"><ErrorState message={data.error} onRetry={loadProfile} /></main>;

  const { user, posts, isOwner, isFollowing, followerCount, followingCount } = data;

  return (
    <main className="profile-main">
      <div className="profile-container">
        <section className="profile-left">
          <section className="profile-wrap">
            <img
              src={user.profile_pic_url ? `${API_BASE}${user.profile_pic_url}` : "/default.png"}
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
                isOwner ? <p className="bio" id="bio-text" style={{ fontStyle: "italic", color: "var(--muted)" }}>Add a bio…</p> : null}

              <div className="profile-actions">
                {isOwner ? (
                  <IconButton
                    label={showEdit ? "Cancel editing profile" : "Edit profile"}
                    variant={showEdit ? "ghost" : "primary"}
                    size="sm"
                    onClick={() => setShowEdit((s) => !s)}
                  >
                    {showEdit ? <CloseIcon /> : <EditIcon />}
                  </IconButton>
                ) : (
                  isFollowing ? (
                    <IconButton label={`Unfollow ${user.username}`} variant="ghost" size="sm" onClick={handleUnfollow}>
                      <UserMinusIcon />
                    </IconButton>
                  ) : (
                    <IconButton label={`Follow ${user.username}`} variant="primary" size="sm" onClick={handleFollow}>
                      <UserPlusIcon />
                    </IconButton>
                  )
                )}
              </div>

              {isOwner && showEdit && (
                <form className="edit-form" encType="multipart/form-data" onSubmit={handleProfileUpdate} noValidate>
                  <div className="form-group">
                    <label><strong>Change Avatar</strong></label>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      disabled={loading}
                    />
                      {avatarError ? <div className="field-error">{avatarError}</div> : null}
                  </div>

                  <div className="form-group">
                    <label><strong>Edit Bio</strong></label>
                    <textarea name="bio" defaultValue={user.bio || ""} placeholder="Tell us about yourself..." disabled={loading} rows="4"></textarea>
                  </div>

                  <div className="form-buttons form-buttons--icons">
                    <IconButton type="submit" label={loading ? "Saving profile" : "Save profile changes"} variant="success" disabled={loading}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton type="button" label="Cancel editing profile" variant="ghost" onClick={() => setShowEdit(false)} disabled={loading}>
                      <CloseIcon />
                    </IconButton>
                  </div>
                </form>
              )}
            </div>
          </section>
        </section>

        <section className="profile-right">
          {posts.length === 0 ? (
            <EmptyState title="No posts yet" message="This profile has not shared anything yet." />
          ) : (
            <div className="grid">
              {posts.map((p) => (
                <div key={p.id} className="grid-item" onClick={() => setSelectedPost(p)}>
                  {p.image_url ? (
                    <>
                      <img src={`${API_BASE}${p.image_url}`} alt="post" />
                      <div className="overlay">
                        <div className="overlay-text">View Post</div>
                      </div>
                    </>
                  ) : (
                    <div className="grid-caption-fallback">
                      <p>{p.caption?.substring(0, 50)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          session={session}
          authorUsername={user.username}
          onClose={() => setSelectedPost(null)}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </main>
  );
}

// client/src/Feed.js
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "./api";
import { useToast } from "./Toast";

export default function Feed({ session }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { addToast } = useToast();

  async function load() {
    try {
      const r = await apiFetch("/api/posts");
      if (!r.ok) {
        const err = await r.json();
        addToast(err.error || "Failed to load posts", "error");
        return;
      }
      const j = await r.json();
      setPosts(j.posts || []);
    } catch (err) {
      console.error("Load posts error:", err);
      addToast("Network error loading posts", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleLike(postId) {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        // optimistic: update UI locally - ensure like_count is always a number
        setPosts(p => p.map(x => {
          if (x.id === Number(postId)) {
            const currentCount = Number(x.like_count) || 0;
            return { ...x, user_liked: !x.user_liked, like_count: x.user_liked ? currentCount - 1 : currentCount + 1 };
          }
          return x;
        }));
        addToast("Like updated", "success");
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to update like", "error");
      }
    } catch (e) {
      console.error("Like error:", e);
      addToast("Network error updating like", "error");
    }
  }

  if (loading) return <main className="main-rail"><p>Loading posts...</p></main>;

  return (
    <main className="main-rail">
      <h1>Posts</h1>
      <div className="posts-container">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">
                <img src={post.profile_pic_url ? `${API_BASE}${post.profile_pic_url}` : '/default.png'} alt="avatar" loading="lazy" />
              </div>
              <a href={`/profile/${post.username}`} className="username-link">{post.username}</a>
            </div>

            <p>{post.caption}</p>
            {post.image_url && (
              <img 
                src={`${API_BASE}${post.image_url}`} 
                alt="Post Image" 
                loading="lazy"
                onClick={() => setSelectedImage(`${API_BASE}${post.image_url}`)}
                style={{ cursor: 'pointer' }}
              />
            )}

            <button
              id={`like-button-${post.id}`}
              className={`like-btn ${post.user_liked ? 'liked' : ''}`}
              data-id={post.id}
              type="button"
              onClick={() => toggleLike(post.id)}
            >
              <span className="heart"></span>
              <span className="count" id={`likes-${post.id}`}>{Number(post.like_count) || 0}</span>
            </button>
          </div>
        ))}
      </div>
      
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}

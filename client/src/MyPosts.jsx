// client/src/MyPostsExact.js
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "./api";

export default function MyPosts({ session }) {
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  async function load() {
    const res = await apiFetch("/api/posts/mine");
    if (res.ok) setPosts((await res.json()).posts || []);
  }

  useEffect(()=>{ load(); }, []);

  async function removePost(id) {
    if (!window.confirm("Delete this post?")) return;
    const res = await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else alert("Delete failed");
  }

  return (
    <main className="main-rail">
      <h1>My Posts</h1>
      <div className="posts-container">
        {posts.length === 0 ? <p>You haven't posted anything yet.</p> :
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">
                  <img src={post.profile_pic_url ? `${API_BASE}${post.profile_pic_url}` : '/default.png'} alt={`avatar of ${post.username}`} loading="lazy" />
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
              <button className="delete-btn" onClick={()=>removePost(post.id)}>Delete</button>
          </div>
        ))
        }
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

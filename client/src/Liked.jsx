// client/src/LikedExact.js
import React, { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "./api";

export default function Liked({ session }) {
  const [posts, setPosts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(()=>{ (async ()=>{
    const res = await apiFetch("/api/posts/liked");
    if (res.ok) setPosts((await res.json()).posts || []);
  })(); }, []);

  async function toggleLike(id) {
    const res = await apiFetch(`/api/posts/${id}/like`, { method: "POST" });
    if (res.ok) setPosts(p => p.filter(x => x.id !== id)); // refresh by removing or you can reload
  }

  return (
    <main className="main-rail">
      <h1>Liked Posts</h1>
      <div className="posts-container">
        {posts.map(post => (
          <div className="post-card" key={post.id}>
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
            <button className="unlike-btn" onClick={()=>toggleLike(post.id)}>Unlike</button>
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

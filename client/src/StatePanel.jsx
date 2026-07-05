import React from "react";

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="state-panel state-panel-wrap">
      <div className="loading-label">{label}</div>
      <div className="spinner" aria-hidden="true" />
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-panel state-panel-wrap">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-panel-wrap state-panel--error">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry ? <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="posts-container" aria-label="Loading posts">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="post-card" key={index} style={{ opacity: 0.85 }}>
          <div className="post-header">
            <div className="skeleton-shimmer" style={{ width: 44, height: 44, borderRadius: "50%" }} />
            <div className="skeleton-shimmer" style={{ height: 14, width: 120 }} />
          </div>
          <div className="skeleton-shimmer" style={{ height: 16, width: "85%", marginTop: 12 }} />
          <div className="skeleton-shimmer" style={{ height: 16, width: "60%", marginTop: 8 }} />
          <div className="skeleton-shimmer" style={{ height: 180, borderRadius: 16, marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}

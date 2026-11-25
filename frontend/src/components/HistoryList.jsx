import { imageSrc } from "../services/api.js";

export default function HistoryList({ items, onDelete, compact = false }) {
  return (
    <section className={`card history-card ${compact ? "compact-history" : ""}`}>
      {!compact && <div className="section-heading history-list-heading"><div><p className="eyebrow">SAVED RESULTS</p><h2>Your scans</h2></div><span className="list-count">{items.length} {items.length === 1 ? "scan" : "scans"}</span></div>}
      {items.length === 0 && <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌁</span><strong>No scans yet</strong><p className="muted">Your uploaded X-rays and results will appear here.</p></div>}
      {items.length > 0 && <div className={`grid ${compact ? "compact-grid" : ""}`}>
        {items.map((h) => (
          <div key={h.id} className="item">
            <div className="history-image-wrap"><img src={imageSrc(h.image_url)} alt={h.filename || "X-ray"} /></div>
            <div className="item-details">
              <span className={`tag ${h.label === "PNEUMONIA" ? "bad" : "good"}`}><span />{h.label}</span>
              <strong className="item-confidence">{(h.confidence * 100).toFixed(1)}% confidence</strong>
              <small>{new Date(h.created_at).toLocaleString()}</small>
              <button className="delete-button" type="button" onClick={() => onDelete(h.id)}>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                  <path d="M4.5 6h11M8 6V4.5h4V6m2.5 0-.6 9.1a1 1 0 0 1-1 .9H7.1a1 1 0 0 1-1-.9L5.5 6m2.8 2.2v5.3m3.4-5.3v5.3" />
                </svg>
                Delete scan
              </button>
            </div>
          </div>
        ))}
      </div>}
    </section>
  );
}

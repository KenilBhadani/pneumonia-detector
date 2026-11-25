import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { deletePrediction, getHistory } from "../services/api.js";
import UploadCard from "../components/UploadCard.jsx";
import HistoryList from "../components/HistoryList.jsx";
import DeleteConfirmation from "../components/DeleteConfirmation.jsx";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadHistory = useCallback(() => {
    return getHistory(getToken)
      .then(setHistory)
      .catch((e) => setError(e.message));
  }, [getToken]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function onDelete(id) {
    setError("");
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (pendingDeleteId === null) return;
    setDeleteLoading(true);
    try {
      await deletePrediction(pendingDeleteId, getToken);
      setHistory((items) => items.filter((item) => item.id !== pendingDeleteId));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
      setPendingDeleteId(null);
    }
  }

  const pneumoniaCount = history.filter((item) => item.label === "PNEUMONIA").length;

  return (
    <>
    <main className="app-main">
      {error && <p className="error">{error}</p>}
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">YOUR HEALTH WORKSPACE</p>
          <h2>Good to see you.</h2>
          <p className="muted">Upload a chest X-ray to get an AI-assisted result and keep your scans organized.</p>
        </div>
        <div className="welcome-mark" aria-hidden="true">+</div>
      </section>

      <section className="stats-row" aria-label="Scan summary">
        <article className="stat-card">
          <span className="stat-icon">↗</span>
          <div><strong>{history.length}</strong><span>Total scans</span></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-warm">◎</span>
          <div><strong>{pneumoniaCount}</strong><span>Flagged results</span></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-blue">✓</span>
          <div><strong>{history.length - pneumoniaCount}</strong><span>Other results</span></div>
        </article>
      </section>

      <div className="dashboard-grid">
        <UploadCard onSuccess={loadHistory} />
        <aside className="card guidance-card">
          <p className="eyebrow">QUICK GUIDE</p>
          <h2>Three simple steps</h2>
          <ol className="steps-list">
            <li><span>1</span><div><strong>Choose an image</strong><small>Use a clear PNG or JPEG chest X-ray.</small></div></li>
            <li><span>2</span><div><strong>Run the analysis</strong><small>Let the model review your uploaded image.</small></div></li>
            <li><span>3</span><div><strong>Review the result</strong><small>Find past scans in your history.</small></div></li>
          </ol>
          <div className="notice-box"><strong>Important</strong><p>This tool is for educational use only and is not a medical diagnosis.</p></div>
        </aside>
      </div>

      <section className="recent-section">
        <div className="section-heading">
          <div><p className="eyebrow">YOUR RECORDS</p><h2>Recent scans</h2></div>
          <Link className="text-button" to="/history">View all <span aria-hidden="true">→</span></Link>
        </div>
        <HistoryList items={history.slice(0, 3)} onDelete={onDelete} compact />
      </section>
    </main>
    <DeleteConfirmation
      open={pendingDeleteId !== null}
      loading={deleteLoading}
      onCancel={() => setPendingDeleteId(null)}
      onConfirm={confirmDelete}
    />
    </>
  );
}

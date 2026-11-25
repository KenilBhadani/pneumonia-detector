import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { predictImage } from "../services/api.js";
import ResultCard from "./ResultCard.jsx";

export default function UploadCard({ onSuccess }) {
  const { getToken } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onPick(f) {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      setError("Choose a PNG or JPEG image.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    onPick(e.dataTransfer.files[0]);
  }

  async function onAnalyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await predictImage(file, getToken);
      setResult(data);
      setFile(null);
      setPreview(null);
      onSuccess(); // tells the dashboard to refresh the history
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card upload-card">
      <div className="card-heading">
        <span className="card-icon" aria-hidden="true">↑</span>
        <div><p className="eyebrow">NEW ANALYSIS</p><h2>Upload a chest X-ray</h2></div>
      </div>
      <label
        className={`upload-field ${dragging ? "dragging" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
        }}
        onDrop={onDrop}
      >
        <span className="upload-symbol" aria-hidden="true">↑</span>
        <strong>Drop an X-ray here or choose a file</strong>
        <small>PNG or JPEG · Select a file from your device</small>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={(e) => {
            onPick(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </label>
      {preview && <img className="preview" src={preview} alt="X-ray preview" />}
      <button className="primary-button analyze-button" onClick={onAnalyze} disabled={!file || loading} aria-busy={loading}>
        {loading && <span className="loading-spinner" aria-hidden="true" />}
        {loading ? "Analyzing..." : "Analyze image"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && <ResultCard result={result} />}
    </section>
  );
}

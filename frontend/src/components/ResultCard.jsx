import { imageSrc } from "../services/api.js";

export default function ResultCard({ result }) {
  const isPneumonia = result.label === "PNEUMONIA";
  const percent = (result.confidence * 100).toFixed(1);

  return (
    <div className={`result ${isPneumonia ? "bad" : "good"}`}>
      <img src={imageSrc(result.image_url)} alt="Uploaded X-ray" />
      <div>
        <span className={`tag ${isPneumonia ? "bad" : "good"}`}><span />{result.label}</span>
        <h2>{isPneumonia ? "Pneumonia detected" : "Looks normal"}</h2>
        <p>Model confidence: {percent}%</p>
        <div className="bar" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" aria-label="Model confidence">
          <div style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

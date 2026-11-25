import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { deletePrediction, getHistory } from "../services/api.js";
import HistoryList from "../components/HistoryList.jsx";
import DeleteConfirmation from "../components/DeleteConfirmation.jsx";

const CHART_COLORS = ["#55a88d", "#d57861"];

function buildDailyCounts(items) {
  const counts = new Map();
  items.forEach((item) => {
    const day = new Date(item.created_at).toISOString().slice(0, 10);
    counts.set(day, (counts.get(day) || 0) + 1);
  });

  return Array.from(counts, ([day, count]) => ({
    day: new Date(`${day}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    count,
    sortKey: day,
  })).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getHistory(getToken)
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [getToken]);

  const resultCounts = useMemo(() => [
    { name: "NORMAL", value: items.filter((item) => item.label === "NORMAL").length },
    { name: "PNEUMONIA", value: items.filter((item) => item.label === "PNEUMONIA").length },
  ], [items]);
  const dailyCounts = useMemo(() => buildDailyCounts(items), [items]);

  function onDelete(id) {
    setError("");
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (pendingDeleteId === null) return;
    setDeleteLoading(true);
    try {
      await deletePrediction(pendingDeleteId, getToken);
      setItems((scans) => scans.filter((scan) => scan.id !== pendingDeleteId));
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteLoading(false);
      setPendingDeleteId(null);
    }
  }

  return (
    <>
    <main className="app-main history-page">
      <div className="history-heading">
        <div>
          <p className="eyebrow">YOUR RECORDS</p>
          <h2>Scan history</h2>
          <p className="muted">Review your previous scans and their analysis results.</p>
        </div>
        <div className="history-total"><strong>{items.length}</strong><span>{items.length === 1 ? "scan saved" : "scans saved"}</span></div>
      </div>
      {error && <p className="error">{error}</p>}

      <section className="charts-grid" aria-label="Scan history charts">
        <article className="card chart-card">
          <div className="section-heading">
            <div><p className="eyebrow">RESULT BREAKDOWN</p><h2>Scan outcomes</h2></div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resultCounts}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={82}
                  paddingAngle={4}
                  stroke="none"
                >
                  {resultCounts.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {items.length === 0 && <span className="chart-empty">No scan data yet</span>}
          </div>
          <div className="chart-legend">
            {resultCounts.map((entry, index) => (
              <span key={entry.name}><i style={{ backgroundColor: CHART_COLORS[index] }} />{entry.name}<strong>{entry.value}</strong></span>
            ))}
          </div>
        </article>

        <article className="card chart-card">
          <div className="section-heading">
            <div><p className="eyebrow">ACTIVITY</p><h2>Scans per day</h2></div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCounts} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="#edf1ef" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#82918f", fontSize: 10 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#82918f", fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" name="Scans" fill="#418f85" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {items.length === 0 && <span className="chart-empty">No scan data yet</span>}
          </div>
        </article>
      </section>

      <HistoryList items={items} onDelete={onDelete} />
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

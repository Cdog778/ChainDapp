import React, { useEffect, useState } from "react";

export default function CaseDashboard({ er, viewCase }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadCases() {
    setLoading(true);

    const nextCaseId = await er.nextCaseId();
    const arr = [];

    for (let i = 0; i < nextCaseId; i++) {
      const c = await er.getCaseFull(i);
      arr.push({
        id: c[0].toString(),
        title: c[1],
        status: c[2],
      });
    }

    setCases(arr);
    setLoading(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  if (loading) return <p>Loading cases...</p>;

  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Case Dashboard</h3>

      {cases.length === 0 && <p>No cases found.</p>}

      {cases.map((c) => (
        <div key={c.id} style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
          <strong>Case {c.id}:</strong> {c.title}
          <br />
          Status: {["Open", "InLab", "Closed"][parseInt(c.status)]}
          <br />
          <button onClick={() => viewCase(c.id)}>View Details</button>
        </div>
      ))}
    </div>
  );
}

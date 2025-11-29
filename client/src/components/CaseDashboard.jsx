import React, { useEffect, useState } from "react";

export default function CaseDashboard({ er, viewCase, startCaseCreation }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadCases() {
    setLoading(true);

    const nextCaseId = await er.nextCaseId();
    let arr = [];

    for (let i = 0; i < nextCaseId; i++) {
      const c = await er.getCaseFull(i);
      arr.push({
        id: i,
        title: c[1],
        status: Number(c[2]),
      });
    }

    setCases(arr);
    setLoading(false);
  }

  useEffect(() => {
    loadCases();
  }, []);

  return (
    <div className="card">
      <h3>Case Dashboard</h3>

      <button className="createButton" onClick={startCaseCreation}>
        + Create New Case
      </button>

      {loading && <p>Loading cases...</p>}
      {!loading && cases.length === 0 && <p>No cases found.</p>}

      {cases.map((c) => (
        <div key={c.id} className="caseRow">
          <div>
            <strong>Case #{c.id}</strong> — {c.title}
            <br />
            Status: {["Open", "InLab", "Closed"][c.status]}
          </div>

          <button onClick={() => viewCase(c.id)}>View Details</button>
        </div>
      ))}
    </div>
  );
}

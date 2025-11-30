import React, { useEffect, useState } from "react";

export default function EvidenceDetails({
  er,
  evidenceId,
  goBack,
  openTimeline,
  openVerify
}) {
  const [ev, setEv] = useState(null);
  const [reports, setReports] = useState([]);

  async function loadEvidence() {
    const e = await er.evidences(evidenceId);
    const r = await er.getLabReports(evidenceId);

    setEv(e);
    setReports(r);
  }

  useEffect(() => {
    loadEvidence();
  }, [evidenceId]);

  if (!ev) return <p>Loading evidence...</p>;

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>← Back</button>

      <h2 style={{ marginBottom: "10px" }}>
        Evidence #{evidenceId}
      </h2>

      <p><strong>Description:</strong> {ev.description}</p>
      <p>
        <strong>Type:</strong>{" "}
        {["Physical","Digital","Biological","Video","Other"][ev.evidenceType]}
      </p>
      <p><strong>Hash:</strong> {ev.ipfsHash}</p>
      <p><strong>Current Holder:</strong> {ev.currentHolder}</p>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button onClick={() => openTimeline(evidenceId)} className="secondaryButton">
          View Timeline
        </button>
        <button onClick={() => openVerify(evidenceId)} className="secondaryButton">
          Verify Integrity
        </button>
      </div>

      <hr />

      <h3>Lab Reports</h3>
      {reports.length === 0 ? (
        <p>No lab reports added.</p>
      ) : (
        reports.map((r, i) => (
          <div key={i} className="noteRow">
            <strong>Report {i + 1}:</strong> {r}
          </div>
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function EvidenceDetails({ er, evidenceId, goBack }) {
  const [ev, setEv] = useState(null);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState([]);

  async function loadEvidence() {
    const e = await er.evidences(evidenceId);
    const r = await er.getLabReports(evidenceId);
    const h = await er.getCustodyHistory(evidenceId);

    setEv(e);
    setReports(r);
    setHistory(h);
  }

  useEffect(() => {
    loadEvidence();
  }, [evidenceId]);

  if (!ev) return <p>Loading evidence...</p>;

  return (
    <div style={{ padding: "10px", border: "1px solid #ccc" }}>
      <button onClick={goBack}>Back</button>
      <h3>Evidence {evidenceId}</h3>

      <p><strong>Description:</strong> {ev.description}</p>
      <p><strong>Type:</strong> {["Physical","Digital","Biological","Video","Other"][ev.evidenceType]}</p>
      <p><strong>Hash:</strong> {ev.ipfsHash}</p>
      <p><strong>Current Holder:</strong> {ev.currentHolder}</p>

      <h4>Lab Reports</h4>
      {reports.length === 0 ? <p>No reports</p> :
        reports.map((r, i) => <div key={i}>Report {i}: {r}</div>)
      }

      <h4>Custody History</h4>
      {history.length === 0 ? <p>No transfers</p> :
        history.map((h, i) => (
          <div key={i}>
            {i}. {h.from} → {h.to} @ {new Date(Number(h.timestamp)*1000).toLocaleString()}
          </div>
        ))
      }
    </div>
  );
}

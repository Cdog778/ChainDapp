import React, { useEffect, useState } from "react";

export default function CaseDetails({
  er,
  caseId,
  goBack,
  openEvidence,
  addNote,
  addEvidence
}) {
  const [caseData, setCaseData] = useState(null);
  const [evidenceIds, setEvidenceIds] = useState([]);
  const [notes, setNotes] = useState([]);

  async function loadCase() {
    const c = await er.getCaseFull(caseId);

    setCaseData({
      id: Number(c[0]),
      title: c[1],
      status: Number(c[2]),
    });

    const evIds = await er.getCaseEvidence(caseId);
    setEvidenceIds(evIds.map((id) => Number(id)));

    const n = await er.getCaseNotes(caseId);
    setNotes(n);
  }

  useEffect(() => {
    loadCase();
  }, [caseId]);

  if (!caseData) return <p>Loading case...</p>;

  return (
    <div className="card">
      <button onClick={goBack} className="backButton">← Back</button>

      <h2>Case #{caseData.id}</h2>
      <p><strong>Title:</strong> {caseData.title}</p>
      <p><strong>Status:</strong> {["Open", "InLab", "Closed"][caseData.status]}</p>

      <hr />

      {/* EVIDENCE SECTION */}
      <h3>Evidence in This Case</h3>

      <button
        className="secondaryButton"
        onClick={() => addEvidence(caseId)}
      >
        + Link New Evidence
      </button>

      {evidenceIds.length === 0 ? (
        <p>No evidence linked.</p>
      ) : (
        evidenceIds.map((id) => (
          <div key={id} className="evidenceRow">
            <span>Evidence #{id}</span>

            <div className="inlineButtons">
              <button onClick={() => openEvidence(id, "details")}>Details</button>
              <button onClick={() => openEvidence(id, "timeline")}>Timeline</button>
              <button onClick={() => openEvidence(id, "verify")}>Verify</button>
            </div>
          </div>
        ))
      )}

      <hr />

      {/* NOTES SECTION */}
      <h3>Case Notes</h3>

      <button
        className="secondaryButton"
        onClick={() => addNote(caseId)}
      >
        + Add Note
      </button>

      {notes.length === 0 ? (
        <p>No notes for this case.</p>
      ) : (
        notes.map((note, i) => (
          <div key={i} className="noteRow">
            <strong>Note {i+1}:</strong> {note}
          </div>
        ))
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

function fileTypeIcon(mimeType = "", name = "") {
  const mt = (mimeType || "").toString().toLowerCase();
  const n = (name || "").toString().toLowerCase();
  if (mt.startsWith("image/")) return "📷";
  if (mt === "application/pdf" || n.endsWith(".pdf")) return "📄";
  if (mt.startsWith("video/")) return "🎥";
  if (mt.startsWith("audio/")) return "🎵";
  return "📁";
}

export default function CaseDetails({
  er,
  caseId,
  goBack,
  openEvidence,
  addNote,
  addEvidence,
}) {
  const [caseData, setCaseData] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [notes, setNotes] = useState([]);

  async function loadCase() {
    const c = await er.getCaseFull(caseId);

    const id = Number(c[0].toString());
    const title = c[1];
    const status = Number(c[2].toString());

    const noteArr = await er.getCaseNotes(caseId);
    setNotes(noteArr);

    const evIdsBn = await er.getCaseEvidence(caseId);
    const evIds = evIdsBn.map((x) => Number(x.toString()));

    const evList = [];

    for (let eid of evIds) {
      const e = await er.evidences(eid);

      let meta = null;
      try {
        meta = JSON.parse(e[3]);
      } catch {}

      evList.push({
        id: eid,
        meta,
      });
    }

    setCaseData({ id, title, status });
    setEvidenceList(evList);
  }

  // eslint-disable-next-line
  useEffect(() => {
    loadCase();
  }, [caseId]);

  if (!caseData) return <p>Loading case...</p>;

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>
        ← Back
      </button>

      <h2>Case #{caseData.id}</h2>

      <p><strong>Title:</strong> {caseData.title}</p>
      <p>
        <strong>Status:</strong>{" "}
        {["Open", "InLab", "Closed"][caseData.status] || "Unknown"}
      </p>

      <hr />

      <h3>Evidence in This Case ({evidenceList.length})</h3>

      <button
        className="secondaryButton"
        onClick={() => addEvidence(caseId)}
        style={{ marginBottom: "10px" }}
      >
        + Link New Evidence
      </button>

      {evidenceList.length === 0 ? (
        <p>No evidence linked.</p>
      ) : (
        evidenceList.map((e) => {
          const mt = e.meta?.mimeType || "";
          const name = e.meta?.name || "";
          const icon = fileTypeIcon(mt, name);
          const thumb =
            mt.startsWith("image/") && e.meta?.cid
              ? `${PINATA_GATEWAY}/${e.meta.cid}`
              : null;

          return (
            <div key={e.id} className="evidenceRow">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {thumb && (
                  <img
                    src={thumb}
                    alt="thumb"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <div>
                  <div>
                    {icon} Evidence #{e.id}
                  </div>
                  {name && (
                    <div style={{ fontSize: "0.85em", color: "#555" }}>{name}</div>
                  )}
                </div>
              </div>

              <div className="inlineButtons">
                <button onClick={() => openEvidence(e.id, "details")}>Details</button>
                <button onClick={() => openEvidence(e.id, "timeline")}>Timeline</button>
                <button onClick={() => openEvidence(e.id, "verify")}>Verify</button>
              </div>
            </div>
          );
        })
      )}

      <hr />

      <h3>Case Notes</h3>

      <button
        className="secondaryButton"
        onClick={() => addNote(caseId)}
      >
        + Add Note
      </button>

      {notes.length === 0 ? (
        <p>No case notes.</p>
      ) : (
        notes.map((note, i) => (
          <div key={i} className="noteRow">
            <strong>Note {i + 1}:</strong> {note}
          </div>
        ))
      )}
    </div>
  );
}

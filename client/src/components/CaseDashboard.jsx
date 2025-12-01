import React, { useEffect, useState } from "react";

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

// SAFE file icon helper
function fileTypeIcon(mimeType, name) {
  const mt = (mimeType || "").toString().toLowerCase();
  const n = (name || "").toString().toLowerCase();

  if (mt.startsWith("image/")) return "📷";
  if (mt === "application/pdf" || n.endsWith(".pdf")) return "📄";
  if (mt.startsWith("video/")) return "🎥";
  if (mt.startsWith("audio/")) return "🎵";
  if (n.endsWith(".zip") || n.endsWith(".rar")) return "📦";

  return "📁";
}

export default function CaseDashboard({ er, viewCase, startCaseCreation }) {
  const [cases, setCases] = useState([]);

  async function loadCases() {
    try {
      const nextBn = await er.nextCaseId();
      const next = Number(nextBn.toString());

      const arr = [];

      for (let id = 0; id < next; id++) {
        const c = await er.getCaseFull(id);

        const title = c[1];
        const status = Number(c[2].toString());

        const evidenceIdsBn = await er.getCaseEvidence(id);
        const evidenceIds = evidenceIdsBn.map((x) => Number(x.toString()));

        // Get evidence thumbnail metadata (if any)
        let thumbCid = null;
        let thumbMime = null;

        if (evidenceIds.length > 0) {
          const ev = await er.evidences(evidenceIds[0]);
          const rawMeta = ev[3];

          try {
            const meta = JSON.parse(rawMeta);
            thumbCid = meta.cid || null;
            thumbMime = meta.mimeType || null;
          } catch {
            // JSON parse failed → ignore
          }
        }

        arr.push({
          id,
          title,
          status,
          evidenceCount: evidenceIds.length,
          thumbCid,
          thumbMime,
        });
      }

      setCases(arr);
    } catch (err) {
      console.error("Error loading cases:", err);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCases();
  }, []);

  function statusLabel(s) {
    return ["Open", "InLab", "Closed"][s] ?? "Unknown";
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Cases</h2>
        <button className="secondaryButton" onClick={startCaseCreation}>
          + New Case
        </button>
      </div>

      {cases.length === 0 ? (
        <p>No cases found.</p>
      ) : (
        cases.map((c) => {
          const icon = fileTypeIcon(c.thumbMime, "");
          const thumbUrl =
            c.thumbCid && c.thumbMime?.toLowerCase().startsWith("image/")
              ? `${PINATA_GATEWAY}/${c.thumbCid}`
              : null;

          return (
            <div
              key={c.id}
              className="evidenceRow"
              style={{ cursor: "pointer" }}
              onClick={() => viewCase(c.id)}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {thumbUrl && (
                  <img
                    src={thumbUrl}
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
                  <div>{icon} Case #{c.id}: {c.title}</div>
                  <div style={{ fontSize: "0.85em", color: "#666" }}>
                    {c.evidenceCount} evidence • {statusLabel(c.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

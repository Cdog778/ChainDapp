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

export default function EvidenceDetails({
  er,
  evidenceId,
  goBack,
  openTimeline,
  openVerify,
}) {
  const [ev, setEv] = useState(null);
  const [meta, setMeta] = useState(null);
  const [labReports, setLabReports] = useState([]);

  async function loadEvidence() {
    const e = await er.evidences(evidenceId);

    const id = Number(e[0].toString());
    const description = e[1];
    const evidenceType = Number(e[2].toString());
    const rawMeta = e[3];
    const currentHolder = e[4];
    const timestampCreated = Number(e[5].toString());

    let parsedMeta = null;
    try {
      parsedMeta = JSON.parse(rawMeta);
    } catch {
      parsedMeta = null;
    }

    const reportsRaw = await er.getLabReports(evidenceId);

    const parsedReports = [];
    for (let i = 0; i < reportsRaw.length; i++) {
      try {
        parsedReports.push({ index: i, ...JSON.parse(reportsRaw[i]) });
      } catch {
        parsedReports.push({ index: i, raw: reportsRaw[i] });
      }
    }

    setEv({
      id,
      description,
      evidenceType,
      rawMeta,
      currentHolder,
      timestampCreated,
    });

    setMeta(parsedMeta);
    setLabReports(parsedReports);
  }

  // eslint-disable-next-line
  useEffect(() => {
    loadEvidence();
  }, [evidenceId]);

  if (!ev) return <p>Loading...</p>;

  const typeLabel =
    ["Physical", "Digital", "Biological", "Video", "Other"][ev.evidenceType] ||
    "Unknown";

  const createdDate = new Date(ev.timestampCreated * 1000).toLocaleString();

  const fileUrl = meta?.cid ? `${PINATA_GATEWAY}/${meta.cid}` : null;
  const mime = meta?.mimeType || "";
  const hashDisplay = meta?.hash || ev.rawMeta;

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>
        ← Back
      </button>

      <h2>Evidence #{ev.id}</h2>

      <p><strong>Description:</strong> {ev.description}</p>
      <p><strong>Type:</strong> {typeLabel}</p>
      <p><strong>Current Holder:</strong> {ev.currentHolder}</p>
      <p><strong>Created:</strong> {createdDate}</p>
      <p><strong>Integrity Hash:</strong> {hashDisplay}</p>

      {fileUrl && (
        <>
          <p>
            <strong>File:</strong>{" "}
            <a href={fileUrl} target="_blank" rel="noreferrer">
              Open Evidence File
            </a>
          </p>

          {mime.startsWith("image/") && (
            <img
              src={fileUrl}
              alt={meta?.name || "evidence"}
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                marginTop: "10px",
              }}
            />
          )}

          {mime === "application/pdf" && (
            <iframe
              src={fileUrl}
              style={{ width: "100%", height: "420px" }}
              title="PDF preview"
            ></iframe>
          )}
        </>
      )}

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          className="secondaryButton"
          onClick={() => openTimeline(ev.id)}
        >
          Timeline
        </button>
        <button
          className="secondaryButton"
          onClick={() => openVerify(ev.id)}
        >
          Verify
        </button>
      </div>

      <hr />

      <h3>Lab Reports</h3>

      {labReports.length === 0 ? (
        <p>No lab reports.</p>
      ) : (
        labReports.map((r) => {
          if (!r.cid) {
            return (
              <div key={r.index} className="noteRow">
                <strong>Report {r.index + 1}:</strong> {r.raw}
              </div>
            );
          }

          const url = `${PINATA_GATEWAY}/${r.cid}`;
          const icon = fileTypeIcon(r.mimeType, r.name || "");

          return (
            <div key={r.index} className="noteRow">
              <strong>
                {icon} Lab Report {r.index + 1}
              </strong>{" "}
              <a href={url} target="_blank" rel="noreferrer">
                View / Download
              </a>
              {r.hash && <div>Hash: {r.hash}</div>}
              {r.encrypted && <div>(encrypted)</div>}
            </div>
          );
        })
      )}
    </div>
  );
}

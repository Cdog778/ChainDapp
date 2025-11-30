import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function IntegrityVerification({ er, evidenceId, goBack }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  async function computeFileHash(selectedFile) {
    const buffer = await selectedFile.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const hashHex = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).toLowerCase();
    return hashHex;
  }

  async function handleVerify() {
    try {
      if (!file) {
        alert("Choose a file first.");
        return;
      }

      setStatus("Computing local hash...");
      const localHash = await computeFileHash(file);

      setStatus("Loading on-chain hash...");
      let stored = await er.getEvidenceHash(evidenceId);

      // Normalize stored hash: strip prefix and lowercase
      stored = stored.toLowerCase().replace(/^hash:/, "");

      const match = localHash === stored;

      setResult(match);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.reason || err.message));
      setResult(null);
    }
  }

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>Back</button>

      <h2>Verify Evidence #{evidenceId}</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br/><br/>

      <button className="primaryButton" onClick={handleVerify}>
        Verify Integrity
      </button>

      {status && <p style={{ marginTop: "10px" }}>{status}</p>}

      {result === true && (
        <p className="matchText" style={{ marginTop: "10px" }}>
          ✅ MATCH — Evidence intact
        </p>
      )}

      {result === false && (
        <p className="mismatchText" style={{ marginTop: "10px" }}>
          ❌ MISMATCH — Evidence tampered
        </p>
      )}
    </div>
  );
}

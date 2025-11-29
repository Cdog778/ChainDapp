import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function IntegrityVerification({ er, evidenceId, goBack }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  async function verify() {
    if (!file) return alert("Upload a file first");

    const stored = await er.getEvidenceHash(evidenceId);

    const fileText = await file.text();
    const encrypted = CryptoJS.AES.encrypt(fileText, "secret-key").toString();
    const localHash = "hash-" + CryptoJS.SHA256(encrypted).toString();

    if (localHash === stored) {
      setResult("✔ MATCH — Evidence intact");
    } else {
      setResult("❌ MISMATCH — Evidence tampered");
    }
  }

  return (
    <div style={{ padding: "10px", border: "1px solid #ccc" }}>
      <button onClick={goBack}>Back</button>

      <h3>Verify Evidence #{evidenceId}</h3>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <button onClick={verify}>Verify Integrity</button>

      <p style={{ whiteSpace: "pre-line" }}>{result}</p>
    </div>
  );
}

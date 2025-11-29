import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function AddLabReport({ er }) {
  const [evidenceId, setEvidenceId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  // Encrypt the file contents
  async function encryptFile(file) {
    const fileText = await file.text();
    return CryptoJS.AES.encrypt(fileText, "secret-key").toString();
  }

  // Hash the encrypted content
  function hashContent(encryptedContent) {
    const hash = CryptoJS.SHA256(encryptedContent).toString();
    return "hash-" + hash;
  }

  async function addReport() {
    try {
      if (!evidenceId) {
        alert("Please provide an evidence ID.");
        return;
      }
      if (!file) {
        alert("Please choose a file.");
        return;
      }

      setStatus("Encrypting file...");
      const encrypted = await encryptFile(file);

      setStatus("Hashing encrypted content...");
      const hash = hashContent(encrypted);

      setStatus("Sending blockchain transaction...");
      const tx = await er.addLabReport(Number(evidenceId), hash);
      await tx.wait();

      setStatus("Success! Lab report added.\nStored hash: " + hash.slice(0, 20) + "...");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.message || String(err)));
    }
  }

  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Add Lab Report</h3>

      <input
        type="number"
        placeholder="Evidence ID"
        value={evidenceId}
        onChange={(e) => setEvidenceId(e.target.value)}
        style={{ width: "200px", marginBottom: "10px" }}
      />

      <br />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <button onClick={addReport}>Add Lab Report</button>

      <p style={{ whiteSpace: "pre-line" }}>{status}</p>
    </div>
  );
}

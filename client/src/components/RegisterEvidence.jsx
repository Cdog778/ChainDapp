import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function RegisterEvidence({ er }) {
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState(0);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  // Compute SHA-256 over raw bytes, normalized to lowercase hex
  async function computeFileHash(selectedFile) {
    const buffer = await selectedFile.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    const hashHex = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).toLowerCase();
    return hashHex;
  }

  async function register() {
    try {
      if (!file) {
        alert("Please choose a file first.");
        return;
      }

      setStatus("Computing file hash...");
      const hashHex = await computeFileHash(file);

      // store a consistent format
      const storedValue = "hash:" + hashHex;

      setStatus("Sending transaction...");
      const tx = await er.registerEvidence(description, evidenceType, storedValue);
      await tx.wait();

      setStatus(`Success! Evidence registered.\nStored hash: ${storedValue}`);
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">
      <h2>Register New Evidence</h2>

      <label>Description</label><br/>
      <input
        type="text"
        value={description}
        placeholder="Short description"
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Evidence Type</label><br/>
      <select
        value={evidenceType}
        onChange={(e) => setEvidenceType(Number(e.target.value))}
      >
        <option value={0}>Physical</option>
        <option value={1}>Digital</option>
        <option value={2}>Biological</option>
        <option value={3}>Video</option>
        <option value={4}>Other</option>
      </select>

      <label>Evidence File</label><br/>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button className="primaryButton" onClick={register}>Register Evidence</button>

      <p>{status}</p>
    </div>
  );
}

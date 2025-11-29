import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function RegisterEvidence({ er }) {
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState(0);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  // Encrypt the file contents
  async function encryptFile(file) {
    const fileText = await file.text();

    // In a real system, this key would be per-case or per-agency, not hard-coded
    const encrypted = CryptoJS.AES.encrypt(fileText, "secret-key").toString();
    return encrypted;
  }

  // Hash the encrypted content (simulating a content-address / IPFS-like ID)
  function hashContent(encryptedContent) {
    const hash = CryptoJS.SHA256(encryptedContent).toString(); // hex string
    // Optional: prefix to make it clear it's local/simulated
    return "hash-" + hash;
  }

  async function register() {
    try {
      if (!file) {
        alert("Please choose a file.");
        return;
      }

      setStatus("Encrypting evidence file...");
      const encrypted = await encryptFile(file);

      setStatus("Hashing encrypted content...");
      const contentHash = hashContent(encrypted);

      setStatus("Sending transaction to blockchain...");
      const tx = await er.registerEvidence(description, evidenceType, contentHash);
      await tx.wait();

      setStatus(
        "Success! Evidence registered.\nStored hash: " +
          contentHash.slice(0, 20) +
          "..."
      );
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.message || String(err)));
    }
  }

  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Register New Evidence</h3>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "300px", marginBottom: "10px" }}
      />

      <br />

      <label>Evidence Type: </label>
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

      <br />
      <br />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <br />

      <button onClick={register}>Register Evidence</button>

      <p style={{ whiteSpace: "pre-line" }}>{status}</p>
    </div>
  );
}

import React, { useState } from "react";
import CryptoJS from "crypto-js";

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

// For demo: fixed key. In real life, you'd handle keys more securely.
const LAB_ENCRYPTION_KEY = "demo-lab-secret-key";

export default function AddLabReport({ er }) {
  const [evidenceId, setEvidenceId] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function uploadEncryptedToPinata(selectedFile, encryptedText) {
    if (!PINATA_JWT) {
      throw new Error("Missing Pinata JWT. Set REACT_APP_PINATA_JWT in .env");
    }

    const blob = new Blob([encryptedText], { type: "text/plain" });
    const encFile = new File([blob], selectedFile.name + ".enc.txt", {
      type: "text/plain",
    });

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", encFile);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Pinata error:", text);
      throw new Error("Pinata upload failed");
    }

    const data = await res.json();
    return data.IpfsHash;
  }

  async function computeFileHash(selectedFile) {
    const text = await selectedFile.text();
    const wordArray = CryptoJS.enc.Utf8.parse(text);
    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).toLowerCase();
  }

  async function addReport() {
    try {
      if (!evidenceId) {
        alert("Enter an evidence ID.");
        return;
      }
      if (!file) {
        alert("Choose a report file (.txt recommended).");
        return;
      }

      setStatus("Encrypting report...");
      const plainText = await file.text();
      const encrypted = CryptoJS.AES.encrypt(
        plainText,
        LAB_ENCRYPTION_KEY
      ).toString();

      setStatus("Computing hash...");
      const hashHex = await computeFileHash(file);

      setStatus("Uploading encrypted report to IPFS...");
      const cid = await uploadEncryptedToPinata(file, encrypted);

      const metadata = {
        hash: hashHex,
        cid,
        name: file.name,
        mimeType: "text/plain",
        kind: "lab",
        encrypted: true,
      };

      setStatus("Sending transaction...");
      const tx = await er.addLabReport(
        Number(evidenceId),
        JSON.stringify(metadata)
      );
      await tx.wait();

      setStatus("Lab report added successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">
      <h2>Add Lab Report</h2>

      <label>Evidence ID</label>
      <br />
      <input
        type="number"
        value={evidenceId}
        onChange={(e) => setEvidenceId(e.target.value)}
      />

      <label>Report File (.txt recommended)</label>
      <br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <button className="primaryButton" onClick={addReport}>
        Attach Lab Report
      </button>

      <p>{status}</p>
    </div>
  );
}

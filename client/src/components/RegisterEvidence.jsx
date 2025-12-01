import React, { useState } from "react";
import CryptoJS from "crypto-js";

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

export default function RegisterEvidence({ er }) {
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState(0);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function computeFileHash(selectedFile) {
    const buffer = await selectedFile.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(buffer);
    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex).toLowerCase();
  }

  async function uploadToPinata(selectedFile) {
    if (!PINATA_JWT) {
      throw new Error("Missing Pinata JWT. Set REACT_APP_PINATA_JWT in .env");
    }

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", selectedFile);

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
    return data.IpfsHash; // CID
  }

  async function register() {
    try {
      if (!file) {
        alert("Please choose a file first.");
        return;
      }

      setStatus("Computing file hash...");
      const hashHex = await computeFileHash(file);

      setStatus("Uploading file to IPFS via Pinata...");
      const cid = await uploadToPinata(file);

      // Store JSON metadata in Evidence.ipfsHash
      const metadata = {
        hash: hashHex,
        cid,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        kind: "evidence",
        encrypted: false,
      };

      setStatus("Sending transaction...");
      const tx = await er.registerEvidence(
        description,
        evidenceType,
        JSON.stringify(metadata)
      );
      await tx.wait();

      setStatus(
        `Success! Evidence registered.\nCID: ${cid}\nHash: ${hashHex}`
      );
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">
      <h2>Register New Evidence</h2>

      <label>Description</label>
      <br />
      <input
        type="text"
        placeholder="Short description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Evidence Type</label>
      <br />
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

      <label>Evidence File</label>
      <br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br />
      <button className="primaryButton" onClick={register}>
        Register Evidence
      </button>

      <p>{status}</p>
    </div>
  );
}

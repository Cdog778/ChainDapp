import React, { useState } from "react";

export default function TransferCustody({ er }) {
  const [evidenceId, setEvidenceId] = useState("");
  const [newHolder, setNewHolder] = useState("");
  const [status, setStatus] = useState("");

  async function transfer() {
    try {
      if (!evidenceId || !newHolder) {
        alert("Please fill all fields");
        return;
      }

      setStatus("Sending transaction...");

      const tx = await er.transferCustody(
        Number(evidenceId),
        newHolder
      );
      await tx.wait();

      setStatus("Custody transferred successfully!");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Transfer Custody</h3>

      <input
        type="number"
        placeholder="Evidence ID"
        value={evidenceId}
        onChange={(e) => setEvidenceId(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <br />

      <input
        type="text"
        placeholder="New holder address"
        value={newHolder}
        onChange={(e) => setNewHolder(e.target.value)}
        style={{ width: "300px", marginBottom: "10px" }}
      />
      <br />

      <button onClick={transfer}>Transfer</button>

      <p>{status}</p>
    </div>
  );
}

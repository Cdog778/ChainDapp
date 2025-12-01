import React, { useState } from "react";

export default function TransferCustody({ er }) {
  const [evidenceId, setEvidenceId] = useState("");
  const [newHolder, setNewHolder] = useState("");
  const [status, setStatus] = useState("");

  async function transfer() {
    try {
      const tx = await er.transferCustody(
        Number(evidenceId),
        newHolder
      );
      await tx.wait();
      setStatus("Transfer successful!");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">
      {/* 🔹 ONLY THIS LINE CHANGED */}
      <h2 className="section-title">Transfer Custody</h2>

      <label>Evidence ID</label>
      <br />
      <input
        type="number"
        value={evidenceId}
        onChange={(e) => setEvidenceId(e.target.value)}
      />

      <label>New holder address</label>
      <br />
      <input
        type="text"
        value={newHolder}
        onChange={(e) => setNewHolder(e.target.value)}
      />

      <button className="primaryButton" onClick={transfer}>
        TRANSFER
      </button>

      <p>{status}</p>
    </div>
  );
}

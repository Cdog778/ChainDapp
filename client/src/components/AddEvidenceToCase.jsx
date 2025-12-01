import React, { useState, useEffect } from "react";

export default function AddEvidenceToCase({ er, caseId, goBack, onLinked }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");

  async function loadEvidence() {
    try {
      const nextIdBn = await er.nextEvidenceId();
      const nextId = Number(nextIdBn.toString());   // SAFE

      let arr = [];
      for (let i = 0; i < nextId; i++) arr.push(i);

      setEvidenceList(arr);
    } catch (err) {
      console.error(err);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadEvidence();
  }, []);

  async function linkEvidence() {
    try {
      setStatus("Linking evidence...");
      const tx = await er.linkEvidenceToCase(Number(caseId), Number(selected));
      await tx.wait();
      setStatus("Linked successfully!");
      onLinked();
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="card">
      <button onClick={goBack} className="backButton">← Back</button>
      <h2>Link Evidence to Case #{caseId}</h2>

      <label>Select Evidence:</label>
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">-- choose --</option>
        {evidenceList.map((id) => (
          <option value={id} key={id}>Evidence #{id}</option>
        ))}
      </select>

      <br /><br />

      <button className="primaryButton" onClick={linkEvidence}>
        Link Evidence
      </button>

      <p>{status}</p>
    </div>
  );
}

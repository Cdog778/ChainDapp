import React, { useState, useEffect } from "react";

export default function AddEvidenceToCase({ er, caseId, onLinked, goBack }) {
  const [evidenceList, setEvidenceList] = useState([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("");

  async function loadEvidence() {
    const nextId = await er.nextEvidenceId();
    let arr = [];
    for (let i = 0; i < nextId; i++) arr.push(i);
    setEvidenceList(arr);
  }

  async function linkEvidence() {
    if (selected === "") {
      alert("Select evidence ID");
      return;
    }

    try {
      setStatus("Linking evidence...");
      const tx = await er.linkEvidenceToCase(caseId, Number(selected));
      await tx.wait();
      setStatus("Linked successfully!");
      onLinked();
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  useEffect(() => {
    loadEvidence();
  }, []);

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>← Back</button>

      <h3>Link Evidence to Case #{caseId}</h3>

      <label>Select Evidence</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">-- Choose Evidence --</option>
        {evidenceList.map((id) => (
          <option key={id} value={id}>Evidence #{id}</option>
        ))}
      </select>

      <br/><br/>

      <button onClick={linkEvidence} className="primaryButton">
        Link Evidence
      </button>

      <p>{status}</p>
    </div>
  );
}

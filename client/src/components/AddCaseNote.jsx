import React, { useState } from "react";

export default function AddCaseNote({ er, caseId, onAdded, goBack }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");

  async function submitNote() {
    if (!note) {
      alert("Enter a note");
      return;
    }

    try {
      setStatus("Submitting note...");
      const tx = await er.addCaseNote(caseId, note);
      await tx.wait();
      setStatus("Note added!");
      onAdded();
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>← Back</button>

      <h3>Add Case Note</h3>

      <textarea
        rows="4"
        placeholder="Write note here..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="textarea"
      />

      <br />

      <button onClick={submitNote} className="primaryButton">Submit Note</button>

      <p>{status}</p>
    </div>
  );
}

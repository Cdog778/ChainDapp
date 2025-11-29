import React, { useState } from "react";

export default function CaseCreation({ er, onCreated }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");

  async function createCase() {
    try {
      if (!title) return alert("Enter a case title");

      setStatus("Creating case...");
      const tx = await er.createCase(title);
      await tx.wait();

      setStatus("Case created successfully!");

      onCreated(); // navigate back or reload dashboard
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div style={styles.card}>
      <h3>Create New Case</h3>

      <input
        type="text"
        placeholder="Case Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
      />

      <button onClick={createCase} style={styles.button}>Create Case</button>

      <p>{status}</p>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fafafa",
  },
  input: {
    width: "300px",
    padding: "8px",
    marginBottom: "12px",
  },
  button: {
    padding: "10px 15px",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

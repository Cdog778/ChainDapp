import React, { useState, useEffect } from "react";

export default function AdminDashboard({ rm, currentAccount, goBack }) {
  const [targetAddress, setTargetAddress] = useState("");
  const [status, setStatus] = useState("");
  const [myRoles, setMyRoles] = useState({
    admin: false,
    inv: false,
    tech: false,
  });

  async function refreshMyRoles() {
    try {
      const roles = await rm.getRoles(currentAccount);
      setMyRoles({
        admin: roles[0],
        inv: roles[1],
        tech: roles[2],
      });
    } catch (err) {
      console.error(err);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    refreshMyRoles();
  }, [currentAccount]);

  async function runTx(fn, label) {
    try {
      if (!targetAddress) return alert("Enter an address.");
      setStatus(`Sending ${label}...`);
      const tx = await fn(targetAddress);
      await tx.wait();
      setStatus(`✔ ${label} successful`);
    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="card">
      <button onClick={goBack} className="backButton">← Back</button>

      <h2>Admin Panel</h2>

      <p><strong>Your address:</strong> {currentAccount}</p>

      <p>
        <strong>Your roles:</strong>{" "}
        {[
          myRoles.admin && "Admin",
          myRoles.inv && "Investigator",
          myRoles.tech && "Technician",
        ].filter(Boolean).join(", ") || "None"}
      </p>

      <hr />

      <h3>Assign Roles</h3>
      <input
        type="text"
        placeholder="0x123..."
        value={targetAddress}
        onChange={(e) => setTargetAddress(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => runTx(rm.addInvestigator, "Add Investigator")}>
          + Investigator
        </button>

        <button onClick={() => runTx(rm.removeInvestigator, "Remove Investigator")}>
          − Investigator
        </button>

        <button onClick={() => runTx(rm.addTechnician, "Add Technician")}>
          + Technician
        </button>

        <button onClick={() => runTx(rm.removeTechnician, "Remove Technician")}>
          − Technician
        </button>

        <button onClick={() => runTx(rm.addAdmin, "Add Admin")}>
          + Admin
        </button>

        <button onClick={() => runTx(rm.removeAdmin, "Remove Admin")}>
          − Admin
        </button>
      </div>

      <p>{status}</p>
    </div>
  );
}

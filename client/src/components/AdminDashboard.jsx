import React, { useState, useEffect } from "react";

export default function AdminDashboard({ rm, currentAccount, goBack }) {
  const [targetAddress, setTargetAddress] = useState("");
  const [status, setStatus] = useState("");
  const [myRoles, setMyRoles] = useState({ admin: false, inv: false, tech: false });

  async function refreshMyRoles() {
    try {
      const [admin, inv, tech] = await rm.getRoles(currentAccount);
      setMyRoles({ admin, inv, tech });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (rm && currentAccount) refreshMyRoles();
  }, [rm, currentAccount]);

  async function runTx(fn, label) {
    try {
      if (!targetAddress) return alert("Enter an address first.");
      setStatus(`Sending ${label} transaction...`);
      const tx = await fn(targetAddress);
      await tx.wait();
      setStatus(`✅ ${label} successful.`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Error: " + (err.reason || err.message));
    }
  }

  return (
    <div className="card">
      <button className="backButton" onClick={goBack}>Back</button>
      <h2>Admin Panel</h2>
      <p>
        You are connected as: <code>{currentAccount}</code>
      </p>
      <p>
        <strong>Your roles:</strong>{" "}
        {[
          myRoles.admin && "Admin",
          myRoles.inv && "Investigator",
          myRoles.tech && "Technician",
        ]
          .filter(Boolean)
          .join(", ") || "Unassigned"}
      </p>

      <hr />

      <h3>Assign / Remove Roles</h3>
      <p>Paste an address (Metamask account) to manage:</p>

      <input
        type="text"
        placeholder="0x1234..."
        value={targetAddress}
        onChange={(e) => setTargetAddress(e.target.value)}
        style={{ width: "100%", maxWidth: "420px" }}
      />

      <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
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

      {status && <p style={{ marginTop: "12px" }}>{status}</p>}
    </div>
  );
}

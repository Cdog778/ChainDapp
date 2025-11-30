import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

import RegisterEvidence from "./components/RegisterEvidence";
import TransferCustody from "./components/TransferCustody";
import AddLabReport from "./components/AddLabReport";
import CaseDashboard from "./components/CaseDashboard";
import CaseCreation from "./components/CaseCreation";
import EvidenceDetails from "./components/EvidenceDetails";
import CustodyTimeline from "./components/CustodyTimeline";
import IntegrityVerification from "./components/IntegrityVerification";
import CaseDetails from "./components/CaseDetails";
import AddCaseNote from "./components/AddCaseNote";
import AddEvidenceToCase from "./components/AddEvidenceToCase";
import ConnectWallet from "./components/ConnectWallet";
import AdminDashboard from "./components/AdminDashboard";

import EvidenceRegistry from "./abis/EvidenceRegistry.json";
import RoleManager from "./abis/RoleManager.json";

const EVIDENCE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const ROLE_MANAGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isInvestigator, setIsInvestigator] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);

  const [view, setView] = useState("home");
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  function computeRoleLabel() {
    const roles = [];
    if (isAdmin) roles.push("Admin");
    if (isInvestigator) roles.push("Investigator");
    if (isTechnician) roles.push("Technician");
    if (!roles.length) roles.push("Unassigned");
    return roles.join(", ");
  }

  async function loadBlockchain() {
    if (!account) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const er = new ethers.Contract(
      EVIDENCE_REGISTRY_ADDRESS,
      EvidenceRegistry.abi,
      signer
    );

    const rm = new ethers.Contract(
      ROLE_MANAGER_ADDRESS,
      RoleManager.abi,
      signer
    );

    const [admin, inv, tech] = await rm.getRoles(account);

    setIsAdmin(admin);
    setIsInvestigator(inv);
    setIsTechnician(tech);

    setContracts({ provider, signer, er, rm });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadBlockchain();
  }, [account]);

  function goHome() {
    setView("home");
    setSelectedCase(null);
    setSelectedEvidence(null);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chain of Custody DApp</h1>

      {!account && (
        <ConnectWallet onConnect={(addr) => setAccount(addr)} />
      )}

      {account && (
        <div style={{ marginBottom: "6px" }}>
          <strong>Connected:</strong> {account}
        </div>
      )}

      {account && contracts && (
        <p style={{ marginBottom: "20px" }}>
          <strong>Role:</strong> {computeRoleLabel()}
        </p>
      )}

      {/* NAVBAR */}
      {contracts && (
        <nav className="navbar">
          <button onClick={goHome}>Home</button>

          {isInvestigator && (
            <>
              <button onClick={() => setView("cases")}>Cases</button>
              <button onClick={() => setView("createCase")}>Create Case</button>
            </>
          )}

          {isAdmin && (
            <button onClick={() => setView("admin")}>Admin</button>
          )}
        </nav>
      )}

      {!contracts && account && <p>Loading blockchain...</p>}

      {/* VIEWS */}
      {contracts && (
        <>
          {/* HOME */}
          {view === "home" && (
            <>
              {isInvestigator && (
                <>
                  <RegisterEvidence er={contracts.er} />
                  <TransferCustody er={contracts.er} />
                </>
              )}

              {isTechnician && <AddLabReport er={contracts.er} />}

              {!isInvestigator && !isTechnician && !isAdmin && (
                <div className="card">
                  <h3>No Role Assigned</h3>
                  <p>Your account has not been assigned a role in the system.</p>
                  <p>Please contact an administrator to be added as:</p>
                  <ul>
                    <li>Investigator</li>
                    <li>Technician</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {/* CASE DASHBOARD */}
          {view === "cases" && (
            <CaseDashboard
              er={contracts.er}
              viewCase={(id) => {
                setSelectedCase(id);
                setView("caseDetails");
              }}
              startCaseCreation={() => setView("createCase")}
            />
          )}

          {/* CASE CREATION */}
          {view === "createCase" && (
            <CaseCreation
              er={contracts.er}
              onCreated={() => setView("cases")}
            />
          )}

          {/* CASE DETAILS */}
          {view === "caseDetails" && (
            <CaseDetails
              er={contracts.er}
              caseId={selectedCase}
              goBack={() => setView("cases")}
              openEvidence={(id, mode) => {
                setSelectedEvidence(id);
                if (mode === "details") setView("evidence");
                if (mode === "timeline") setView("timeline");
                if (mode === "verify") setView("verify");
              }}
              addNote={(id) => {
                setSelectedCase(id);
                setView("addCaseNote");
              }}
              addEvidence={(id) => {
                setSelectedCase(id);
                setView("addEvidenceToCase");
              }}
            />
          )}

          {/* EVIDENCE DETAILS */}
          {view === "evidence" && (
            <EvidenceDetails
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
              openTimeline={(id) => {
                setSelectedEvidence(id);
                setView("timeline");
              }}
              openVerify={(id) => {
                setSelectedEvidence(id);
                setView("verify");
              }}
            />
          )}
          {/* TIMELINE */}
          {view === "timeline" && (
            <CustodyTimeline
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
            />
          )}

          {/* VERIFY */}
          {view === "verify" && (
            <IntegrityVerification
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
            />
          )}

          {/* ADD CASE NOTE */}
          {view === "addCaseNote" && (
            <AddCaseNote
              er={contracts.er}
              caseId={selectedCase}
              goBack={() => setView("caseDetails")}
              onAdded={() => setView("caseDetails")}
            />
          )}

          {/* LINK EVIDENCE */}
          {view === "addEvidenceToCase" && (
            <AddEvidenceToCase
              er={contracts.er}
              caseId={selectedCase}
              goBack={() => setView("caseDetails")}
              onLinked={() => setView("caseDetails")}
            />
          )}

          {/* ADMIN */}
          {view === "admin" && (
            <AdminDashboard
              rm={contracts.rm}
              currentAccount={account}
              goBack={goHome}
            />
          )}
        </>
      )}
    </div>
  );
}

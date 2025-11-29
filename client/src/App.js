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


import EvidenceRegistry from "./abis/EvidenceRegistry.json";
import RoleManager from "./abis/RoleManager.json";

// Replace with deployed addresses
const EVIDENCE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const ROLE_MANAGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function App() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);

  const [isInvestigator, setIsInvestigator] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);

  const [view, setView] = useState("home");
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

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

    // Load roles
    setIsInvestigator(await rm.isInvestigator(account));
    setIsTechnician(await rm.isTechnician(account));

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
        <div style={{ marginBottom: "15px" }}>
          <strong>Connected:</strong> {account}
        </div>
      )}

      {/* ------- CLEAN SINGLE NAVBAR -------- */}
      {contracts && (
        <nav className="navbar">
          <button onClick={goHome}>Home</button>
          <button onClick={() => setView("cases")}>Cases</button>
          {isInvestigator && (
            <button onClick={() => setView("createCase")}>
              Create Case
            </button>
          )}
        </nav>
      )}

      {!contracts && account && <p>Loading blockchain...</p>}

      {/* ======================= VIEWS ======================= */}
      {contracts && (
        <>

          {/* HOME VIEW */}
          {view === "home" && (
            <>
              {isInvestigator && (
                <>
                  <RegisterEvidence er={contracts.er} />
                  <TransferCustody er={contracts.er} />
                </>
              )}

              {isTechnician && <AddLabReport er={contracts.er} />}
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

          {/* VERIFY INTEGRITY */}
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

          {view === "addEvidenceToCase" && (
            <AddEvidenceToCase
              er={contracts.er}
              caseId={selectedCase}
              goBack={() => setView("caseDetails")}
              onLinked={() => setView("caseDetails")}
            />
          )}
        </>
      )}
    </div>
  );
}

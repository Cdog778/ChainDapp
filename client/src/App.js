import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import RegisterEvidence from "./components/RegisterEvidence";
import TransferCustody from "./components/TransferCustody";
import AddLabReport from "./components/AddLabReport";
import CaseDashboard from "./components/CaseDashboard";
import EvidenceDetails from "./components/EvidenceDetails";
import CustodyTimeline from "./components/CustodyTimeline";
import IntegrityVerification from "./components/IntegrityVerification";

import EvidenceRegistry from "./abis/EvidenceRegistry.json";
import RoleManager from "./abis/RoleManager.json";

const EVIDENCE_REGISTRY_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const ROLE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function App() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [view, setView] = useState("home");   // navigation state
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  // -------------------------------
  // Connect to MetaMask wallet
  // -------------------------------
  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  }

  // -------------------------------
  // Load Blockchain Contracts
  // -------------------------------
  async function loadBlockchain() {
    if (!account) return;

    try {
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

      setContracts({ provider, signer, er, rm });
    } catch (err) {
      console.error("Blockchain load error:", err);
    }
  }

  useEffect(() => {
    loadBlockchain();
  }, [account]);

  // -------------------------------
  // Navigation Helpers
  // -------------------------------
  function goHome() {
    setView("home");
    setSelectedCase(null);
    setSelectedEvidence(null);
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Chain of Custody DApp</h1>

      {!account && (
        <button onClick={connectWallet} style={{ padding: "10px" }}>
          Connect Wallet
        </button>
      )}

      {account && <p><strong>Connected:</strong> {account}</p>}

      {!contracts && account && <p>Loading smart contracts...</p>}

      {contracts && (
        <>
          {/* HOME PAGE */}
          {view === "home" && (
            <>
              <RegisterEvidence er={contracts.er} />
              <TransferCustody er={contracts.er} />
              <AddLabReport er={contracts.er} />

              <button
                style={{ marginTop: "20px" }}
                onClick={() => setView("cases")}
              >
                View Case Dashboard
              </button>
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
            />
          )}

          {/* CASE DETAILS PAGE */}
          {view === "caseDetails" && (
            <>
              <button onClick={goHome}>Home</button>

              <h2>Case #{selectedCase}</h2>

              <button
                onClick={() => {
                  setSelectedEvidence(selectedCase);
                  setView("evidence");
                }}
              >
                View Evidence Details
              </button>

              <button
                onClick={() => {
                  setSelectedEvidence(selectedCase);
                  setView("timeline");
                }}
              >
                View Custody Timeline
              </button>

              <button
                onClick={() => {
                  setSelectedEvidence(selectedCase);
                  setView("verify");
                }}
              >
                Verify Integrity
              </button>
            </>
          )}

          {/* EVIDENCE DETAILS */}
          {view === "evidence" && (
            <EvidenceDetails
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
            />
          )}

          {/* CUSTODY TIMELINE */}
          {view === "timeline" && (
            <CustodyTimeline
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
            />
          )}

          {/* INTEGRITY VERIFICATION */}
          {view === "verify" && (
            <IntegrityVerification
              er={contracts.er}
              evidenceId={selectedEvidence}
              goBack={() => setView("caseDetails")}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;

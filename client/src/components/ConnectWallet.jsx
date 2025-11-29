import React, { useState } from "react";

export default function ConnectWallet({ onConnect }) {
  const [status, setStatus] = useState("");

  async function connect() {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected");
        return;
      }

      setStatus("Connecting...");

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        setStatus("No accounts found");
        return;
      }

      const account = accounts[0];
      setStatus("Connected: " + account);

      // Pass connected account back to App.js
      onConnect(account);

      // Watch for account change
      window.ethereum.on("accountsChanged", (accs) => {
        if (accs.length > 0) {
          onConnect(accs[0]);
          setStatus("Connected: " + accs[0]);
        } else {
          setStatus("Disconnected");
        }
      });

    } catch (err) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "400px" }}>
      <h3>Connect Wallet</h3>

      <button onClick={connect} className="primaryButton">
        Connect MetaMask
      </button>

      <p>{status}</p>
    </div>
  );
}

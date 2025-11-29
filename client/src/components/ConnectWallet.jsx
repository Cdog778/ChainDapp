import React from "react";

export default function ConnectWallet({ onConnected }) {
  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    onConnected(accounts[0]);
  };

  return (
    <button onClick={connect} style={{ padding: "10px", margin: "10px" }}>
      Connect Wallet
    </button>
  );
}

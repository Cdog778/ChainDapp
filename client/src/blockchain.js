import { ethers } from "ethers";
import EvidenceRegistry from "./abis/EvidenceRegistry.json";
import RoleManager from "./abis/RoleManager.json";

const EVIDENCE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const ROLE_MANAGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export async function loadBlockchain() {
  if (!window.ethereum) throw new Error("MetaMask not installed");

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

  return { provider, signer, er, rm };
}

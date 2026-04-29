import { ethers } from "ethers";

export const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const abi = [
  "function jobCount() view returns (uint)",
  "function createJob(address _freelancer, string _title, string _description) payable",
  "function acceptJob(uint _jobId)",
  "function completeJob(uint _jobId)",
  "function releasePayment(uint _jobId)",
  "function getJob(uint _jobId) view returns (uint id, address client, address freelancer, uint amount, uint8 status, string title, string description)"
];

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, abi, signer);
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
}

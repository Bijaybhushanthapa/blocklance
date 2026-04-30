# BlockLance

BlockLance is a blockchain-based freelance escrow platform that allows clients and freelancers to complete work securely using smart contracts.

## Features

- Client can create freelance jobs
- ETH is locked in a smart contract escrow
- Freelancer can accept assigned jobs
- Client can mark jobs as completed
- Client can release payment to freelancer
- React dashboard interface
- MetaMask wallet integration
- MongoDB backend for off-chain job metadata

## Tech Stack

- React.js
- Solidity
- Hardhat
- Ethers.js
- MetaMask
- Node.js
- Express.js
- MongoDB Atlas

## System Workflow

1. Client creates a job and deposits ETH.
2. Smart contract stores the job and locks payment.
3. Freelancer accepts the job.
4. Client marks the job as completed.
5. Client releases payment.
6. Freelancer receives ETH.

## How to Run

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install

# 🚀 Run the Project (All Commands)

## 1. Start Local Blockchain

```bash
npx hardhat node
2. Deploy Smart Contract

Open a new terminal:

npx hardhat run scripts/deploy.js --network localhost

After running this, copy the contract address from the terminal output:

FreelanceEscrow deployed to: 0x.....
3. Update Contract Address

Open the file:

nano client/src/blockchain.js

Replace this line:

export const contractAddress = "YOUR_ADDRESS";

With your deployed contract address:

export const contractAddress = "0x...";
4. Start Backend Server
cd server
npm install
npm run dev

Backend runs on:

http://localhost:5000
5. Start Frontend
cd client
npm install
npm run dev

Open the app:

http://localhost:5173
🦊 MetaMask Setup

Add Hardhat local network:

Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
Import Accounts
Client Account
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Freelancer Account
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
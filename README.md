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

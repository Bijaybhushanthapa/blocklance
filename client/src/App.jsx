import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { connectWallet, getContract } from "./blockchain";
import "./index.css";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState("");
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setWalletConnected(true);
          await loadJobs();
        } else {
          setAccount("");
          setWalletConnected(false);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  function shortAddress(address) {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async function loadJobs() {
    try {
      const contract = await getContract();
      const count = await contract.jobCount();
      console.log("job count =", Number(count));

      const jobList = [];

      for (let i = 1; i <= Number(count); i++) {
        const job = await contract.getJob(i);

        jobList.push({
          id: Number(job[0]),
          client: job[1],
          freelancer: job[2],
          amount: ethers.formatEther(job[3]),
          status: Number(job[4]),
          title: job[5],
          description: job[6]
        });
      }

      setJobs(jobList);
    } catch (error) {
      console.log("loadJobs error:", error);
    }
  }

  async function handleConnectWallet() {
    try {
      await connectWallet();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setWalletConnected(true);
      await loadJobs();
      setMessage("Wallet connected successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to connect wallet.");
    }
  }

  async function handleCreateJob(event) {
    event.preventDefault();

    try {
      const cleanAddress = freelancerAddress.trim();

      if (!ethers.isAddress(cleanAddress)) {
        setMessage("Please enter a valid freelancer wallet address.");
        return;
      }

      const contract = await getContract();
      const tx = await contract.createJob(
        cleanAddress,
        title.trim(),
        description.trim(),
        {
          value: ethers.parseEther(amount.trim())
        }
      );

      setMessage("Transaction pending...");
      const receipt = await tx.wait();

      const count = await contract.jobCount();
      const jobId = Number(count);

      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobId,
          title,
          description,
          clientAddress: account,
          freelancerAddress: cleanAddress,
          amountEth: amount,
          txHash: receipt.hash
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save job metadata");
      }

      await loadJobs();

      setMessage("✅ Job saved on blockchain + MongoDB!");
      setFreelancerAddress("");
      setAmount("");
      setTitle("");
      setDescription("");
    } catch (error) {
      setMessage(error.reason || error.message || "Failed to create job.");
    }
  }

  async function acceptJobById(jobId) {
    try {
      const contract = await getContract();
      const tx = await contract.acceptJob(jobId);

      setMessage("Transaction pending...");
      await tx.wait();
      await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Accepted"
      })
    });
      await loadJobs();

      setMessage(`Job ${jobId} accepted successfully.`);
    } catch (error) {
      setMessage(error.reason || error.message || "Failed to accept job.");
    }
  }

  async function completeJobById(jobId) {
    try {
      const contract = await getContract();
      const tx = await contract.completeJob(jobId);

      setMessage("Transaction pending...");
      await tx.wait();
      await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Completed"
      })
    });
      await loadJobs();

      setMessage(`Job ${jobId} marked completed.`);
    } catch (error) {
      setMessage(error.reason || error.message || "Failed to complete job.");
    }
  }

  async function releasePaymentById(jobId) {
    try {
      const contract = await getContract();
      const tx = await contract.releasePayment(jobId);

      setMessage("Transaction pending...");
      await tx.wait();
      await fetch(`http://localhost:5000/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "Paid"
      })
    });
      await loadJobs();

      setMessage(`Payment released for job ${jobId}.`);
    } catch (error) {
      setMessage(error.reason || error.message || "Failed to release payment.");
    }
  }

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === 1).length;
  const completedJobs = jobs.filter((job) => job.status === 2).length;
  const paidJobs = jobs.filter((job) => job.status === 3);
  const totalPaid = paidJobs.reduce((sum, job) => sum + Number(job.amount), 0);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">B</div>
          <div>
            <h2>BlockLance</h2>
            <p>Freelancer Escrow System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Jobs</button>
        </nav>

        <div className="sidebar-card">
          <h3>Connected Wallet</h3>
          <p className="status-dot-row">
            <span className="dot green"></span>
            {walletConnected ? "Connected" : "Not connected"}
          </p>
          <p className="muted">
            {walletConnected ? shortAddress(account) : "Connect MetaMask"}
          </p>
          <span className="mini-tag">Hardhat Local</span>
        </div>

        <div className="sidebar-card">
          <h3>Network</h3>
          <p className="status-dot-row">
            <span className="dot green"></span>
            Hardhat Local
          </p>
          <p className="muted">Chain ID 31337</p>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <div>
            <h1>Welcome back! 👋</h1>
            <p>Manage your freelance jobs on the blockchain</p>
          </div>

          <div className="wallet-pill-row">
            <button className="connect-btn" onClick={handleConnectWallet}>
              {walletConnected ? "Wallet Connected" : "Connect Wallet"}
            </button>

            <div className="wallet-pill">
              <span className="dot green"></span>
              {walletConnected ? "Wallet Connected" : "Wallet Disconnected"}
            </div>

            <div className="wallet-pill">
              Role:{" "}
              {jobs.some(
                (job) =>
                  walletConnected &&
                  account &&
                  account.toLowerCase() === job.client.toLowerCase()
              )
                ? "Client"
                : jobs.some(
                    (job) =>
                      walletConnected &&
                      account &&
                      account.toLowerCase() === job.freelancer.toLowerCase()
                  )
                ? "Freelancer"
                : "Viewer"}
            </div>
          </div>
        </div>

        <section className="hero-grid">
          <div className="panel create-panel">
            <div className="panel-header">
              <h2>Create New Job</h2>
            </div>

            <form onSubmit={handleCreateJob} className="dashboard-form">
              <label>Job Title</label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Job Description</label>
              <textarea
                placeholder="Describe the job in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <label>Freelancer Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={freelancerAddress}
                onChange={(e) => setFreelancerAddress(e.target.value)}
                required
              />

              <label>Amount (ETH)</label>
              <input
                type="text"
                placeholder="e.g. 0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <button type="submit" className="primary-btn">
                Create Blockchain Job
              </button>
            </form>
          </div>

          <div className="right-panels">
            <div className="stats-grid">
              <div className="stat-card blue">
                <h4>Total Jobs</h4>
                <h2>{totalJobs}</h2>
                <p>All time jobs</p>
              </div>

              <div className="stat-card green-card">
                <h4>Active Jobs</h4>
                <h2>{activeJobs}</h2>
                <p>In progress</p>
              </div>

              <div className="stat-card gold">
                <h4>Completed</h4>
                <h2>{completedJobs}</h2>
                <p>Finished jobs</p>
              </div>

              <div className="stat-card purple">
                <h4>Total Paid</h4>
                <h2>{totalPaid.toFixed(2)} ETH</h2>
                <p>Total released</p>
              </div>
            </div>

            <div className="info-card">
              <h3>Secure Escrow System</h3>
              <p>
                Payments are held securely in the smart contract and released
                only when the job is completed.
              </p>
            </div>
          </div>
        </section>

        <section className="jobs-panel">
          <div className="jobs-header">
            <h2>All Jobs</h2>
            <button className="secondary-btn" onClick={loadJobs}>
              Refresh
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">No jobs found.</div>
          ) : (
            <div className="jobs-table">
              <div className="table-row table-head">
                <div>ID</div>
                <div>Title</div>
                <div>Client</div>
                <div>Freelancer</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {jobs.map((job) => (
                <div className="table-row" key={job.id}>
                  <div>{job.id}</div>

                  <div>
                    <div className="job-title">{job.title}</div>
                    <div className="job-subtitle">{job.description}</div>
                  </div>

                  <div>{shortAddress(job.client)}</div>
                  <div>{shortAddress(job.freelancer)}</div>
                  <div>{job.amount} ETH</div>

                  <div>
                    <span className={`status-badge status-${job.status}`}>
                      {
                        {
                          0: "🟦 Created",
                          1: "🟨 In Progress",
                          2: "🟩 Completed",
                          3: "🟪 Paid"
                        }[job.status]
                      }
                    </span>
                  </div>

                  <div>
                    {job.status === 0 &&
                      walletConnected &&
                      account &&
                      account.toLowerCase() === job.freelancer.toLowerCase() && (
                        <button
                          className="action-btn purple-btn"
                          onClick={() => acceptJobById(job.id)}
                        >
                          Accept Job
                        </button>
                      )}

                    {job.status === 1 &&
                      walletConnected &&
                      account &&
                      account.toLowerCase() === job.client.toLowerCase() && (
                        <button
                          className="action-btn green-btn"
                          onClick={() => completeJobById(job.id)}
                        >
                          Complete Job
                        </button>
                      )}

                    {job.status === 2 &&
                      walletConnected &&
                      account &&
                      account.toLowerCase() === job.client.toLowerCase() && (
                        <button
                          className="action-btn blue-btn"
                          onClick={() => releasePaymentById(job.id)}
                        >
                          Release Payment
                        </button>
                      )}

                    {job.status === 3 && <span className="paid-text">✓ Paid</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {message && <section className="message-bar">{message}</section>}
      </main>
    </div>
  );
}

export default App;

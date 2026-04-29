const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const jobsFilePath = path.join(__dirname, "../data/jobs.json");

function readJobs() {
  try {
    const data = fs.readFileSync(jobsFilePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    return [];
  }
}

function writeJobs(jobs) {
  fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));
}

function getNextId(jobs) {
  if (jobs.length === 0) return 1;
  return Math.max(...jobs.map((job) => job.id)) + 1;
}

router.get("/", (req, res) => {
  const jobs = readJobs();
  res.json(jobs);
});

router.get("/:id", (req, res) => {
  const jobs = readJobs();
  const jobId = Number(req.params.id);
  const job = jobs.find((item) => item.id === jobId);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  res.json(job);
});

router.post("/", (req, res) => {
  const { title, description, budget, clientName } = req.body;

  if (!title || !description || !budget || !clientName) {
    return res.status(400).json({
      message: "title, description, budget and clientName are required"
    });
  }

  const jobs = readJobs();

  const newJob = {
    id: getNextId(jobs),
    title: String(title).trim(),
    description: String(description).trim(),
    budget: Number(budget),
    clientName: String(clientName).trim(),
    freelancerName: "",
    status: "open",
    createdAt: new Date().toISOString()
  };

  jobs.push(newJob);
  writeJobs(jobs);

  res.status(201).json(newJob);
});

router.patch("/:id/accept", (req, res) => {
  const { freelancerName } = req.body;
  const jobs = readJobs();
  const jobId = Number(req.params.id);

  const jobIndex = jobs.findIndex((item) => item.id === jobId);

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!freelancerName) {
    return res.status(400).json({ message: "freelancerName is required" });
  }

  if (jobs[jobIndex].status !== "open") {
    return res.status(400).json({
      message: "Only open jobs can be accepted"
    });
  }

  jobs[jobIndex].freelancerName = String(freelancerName).trim();
  jobs[jobIndex].status = "in_progress";

  writeJobs(jobs);

  res.json(jobs[jobIndex]);
});

router.patch("/:id/complete", (req, res) => {
  const jobs = readJobs();
  const jobId = Number(req.params.id);

  const jobIndex = jobs.findIndex((item) => item.id === jobId);

  if (jobIndex === -1) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (jobs[jobIndex].status !== "in_progress") {
    return res.status(400).json({
      message: "Only in-progress jobs can be completed"
    });
  }

  jobs[jobIndex].status = "completed";
  jobs[jobIndex].completedAt = new Date().toISOString();

  writeJobs(jobs);

  res.json(jobs[jobIndex]);
});

router.delete("/:id", (req, res) => {
  const jobs = readJobs();
  const jobId = Number(req.params.id);

  const filteredJobs = jobs.filter((item) => item.id !== jobId);

  if (filteredJobs.length === jobs.length) {
    return res.status(404).json({ message: "Job not found" });
  }

  writeJobs(filteredJobs);

  res.json({ message: "Job deleted successfully" });
});

module.exports = router;
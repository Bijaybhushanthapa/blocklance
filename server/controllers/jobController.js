const Job = require("../models/Job");

async function createJobMetadata(req, res) {
  try {
    const {
      jobId,
      title,
      description,
      clientAddress,
      freelancerAddress,
      amountEth,
      txHash
    } = req.body;

    if (
      jobId === undefined ||
      !title ||
      !description ||
      !clientAddress ||
      !freelancerAddress ||
      !amountEth
    ) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const existingJob = await Job.findOne({ jobId });

    if (existingJob) {
      return res.status(409).json({
        message: "Job metadata already exists for this jobId"
      });
    }

    const newJob = await Job.create({
      jobId,
      title,
      description,
      clientAddress,
      freelancerAddress,
      amountEth,
      txHash: txHash || "",
      status: "Created"
    });

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create job metadata",
      error: error.message
    });
  }
}

async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: error.message
    });
  }
}

async function getJobByJobId(req, res) {
  try {
    const job = await Job.findOne({ jobId: Number(req.params.jobId) });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch job",
      error: error.message
    });
  }
}

async function updateJobStatus(req, res) {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Created", "Accepted", "Completed", "Paid"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { jobId: Number(req.params.jobId) },
      { status },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update job status",
      error: error.message
    });
  }
}

module.exports = {
  createJobMetadata,
  getAllJobs,
  getJobByJobId,
  updateJobStatus
};

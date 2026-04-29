const express = require("express");
const {
  createJobMetadata,
  getAllJobs,
  getJobByJobId,
  updateJobStatus
} = require("../controllers/jobController");

const router = express.Router();

router.post("/", createJobMetadata);
router.get("/", getAllJobs);
router.get("/:jobId", getJobByJobId);
router.patch("/:jobId/status", updateJobStatus);

module.exports = router;

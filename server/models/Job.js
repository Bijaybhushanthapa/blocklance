const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: {
      type: Number,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    clientAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    freelancerAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    amountEth: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Created", "Accepted", "Completed", "Paid"],
      default: "Created"
    },
    txHash: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Job", jobSchema);

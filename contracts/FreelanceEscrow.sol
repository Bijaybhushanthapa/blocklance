// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FreelanceEscrow {
    enum Status {
        Created,
        Accepted,
        Completed,
        Paid
    }

    struct Job {
        uint id;
        address client;
        address freelancer;
        uint amount;
        Status status;
        string title;
        string description;
    }

    uint public jobCount = 0;

    mapping(uint => Job) public jobs;

    function createJob(
        address _freelancer,
        string memory _title,
        string memory _description
    ) public payable {
        require(msg.value > 0, "Must send ETH");

        jobCount++;

        jobs[jobCount] = Job({
            id: jobCount,
            client: msg.sender,
            freelancer: _freelancer,
            amount: msg.value,
            status: Status.Created,
            title: _title,
            description: _description
        });
    }

    function acceptJob(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.freelancer, "Not assigned freelancer");
        require(job.status == Status.Created, "Invalid status");

        job.status = Status.Accepted;
    }

    function completeJob(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can complete");
        require(job.status == Status.Accepted, "Invalid status");

        job.status = Status.Completed;
    }

    function releasePayment(uint _jobId) public {
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only client can release payment");
        require(job.status == Status.Completed, "Job not completed");

        job.status = Status.Paid;
        payable(job.freelancer).transfer(job.amount);
    }

    function getJob(uint _jobId)
        public
        view
        returns (
            uint id,
            address client,
            address freelancer,
            uint amount,
            Status status,
            string memory title,
            string memory description
        )
    {
        Job memory job = jobs[_jobId];
        return (
            job.id,
            job.client,
            job.freelancer,
            job.amount,
            job.status,
            job.title,
            job.description
        );
    }
}
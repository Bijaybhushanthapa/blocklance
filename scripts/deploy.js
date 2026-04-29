async function main() {
  const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
  const freelanceEscrow = await FreelanceEscrow.deploy();

  await freelanceEscrow.waitForDeployment();

  console.log("FreelanceEscrow deployed to:", await freelanceEscrow.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

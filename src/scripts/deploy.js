const main = async () => {
	// Deploying TestContract
	const testContractFactory = await ethers.getContractFactory("TestContract")
	const testContract = await testContractFactory.deploy()
	await testContract.deployed()
	console.log("Custom approach Contract deployed to:", testContract.address)

	// Deployin TestContract2771
	const testContractFactory2771 = await ethers.getContractFactory("Test2771")
	const testContract2771 = await testContractFactory2771.deploy(
		"0xF82986F574803dfFd9609BE8b9c7B92f63a1410E"
	)
	await testContract2771.deployed()
	console.log(
		"EIP2771 approach Contract deployed to:",
		testContract2771.address
	)
}

const runMain = async () => {
	try {
		await main()
		process.exit(0)
	} catch (error) {
		console.log(error)
		process.exit(1)
	}
}

runMain()

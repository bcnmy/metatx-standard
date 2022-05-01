const { expect } = require("chai")
const abi = require("ethereumjs-abi")

describe("Test2771 Contract", async () => {
	let accounts, testContract, forwarder, testnetDai

	before("before test", async () => {
		accounts = await ethers.getSigners()

		const testnetDaiFactory = await ethers.getContractFactory("TestnetDAI")
		testnetDai = await testnetDaiFactory.deploy()
		await testnetDai.deployed()

		const Forwarder = await ethers.getContractFactory("BiconomyForwarder")
		forwarder = await Forwarder.deploy(await accounts[0].getAddress())
		await forwarder.deployed()

		const testContractFactory = await ethers.getContractFactory(
			"TestContract2771"
		)
		testContract = await testContractFactory.deploy(forwarder.address)
		await testContract.deployed()
	})

	describe("personal sign", function () {
		it("executes call successfully", async function () {
			const req = await testContract.populateTransaction.setQuote(
				"Metatx"
			)
			req.from = await accounts[1].getAddress()
			req.batchNonce = 0
			req.batchId = 0
			req.txGas = req.gasLimit.toNumber()
			req.tokenGasPrice = 0
			req.deadline = 0
			delete req.gasPrice
			delete req.gasLimit
			delete req.chainId
			req.token = testnetDai.address
			const hashToSign = abi.soliditySHA3(
				[
					"address",
					"address",
					"address",
					"uint256",
					"uint256",
					"uint256",
					"uint256",
					"uint256",
					"bytes32",
				],
				[
					req.from,
					req.to,
					req.token,
					req.txGas,
					req.tokenGasPrice,
					req.batchId,
					req.batchNonce,
					req.deadline,
					ethers.utils.keccak256(req.data),
				]
			)
			const sig = await accounts[1].signMessage(hashToSign)
			const tx = await forwarder.executePersonalSign(req, sig)
			const receipt = await tx.wait((confirmations = 1))
			console.log(`gas used from receipt ${receipt.gasUsed.toNumber()}`)
			//expect(await testRecipient.callsMade(req.from)).to.equal(1);
		})

		it("Updates nonces", async function () {
			expect(
				await forwarder.getNonce(await accounts[1].getAddress(), 0)
			).to.equal(1)
		})
	})
})

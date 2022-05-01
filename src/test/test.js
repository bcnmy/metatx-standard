const { assert } = require("chai")
const sigUtil = require("eth-sig-util")

require("dotenv").config()

const TestABI = require("../artifacts/contracts/TestContract.sol/TestContract.json")

let wallet = new ethers.Wallet.createRandom()
let publicKey = wallet.address
let privateKey = wallet._signingKey().privateKey

const domainType = [
	{ name: "name", type: "string" },
	{ name: "version", type: "string" },
	{ name: "verifyingContract", type: "address" },
	{ name: "salt", type: "bytes32" },
]

const metaTransactionType = [
	{ name: "nonce", type: "uint256" },
	{ name: "from", type: "address" },
	{ name: "functionSignature", type: "bytes" },
]

let domainData

const getTXData = async (nonce, functionSignature) => {
	let message = {
		nonce: parseInt(nonce),
		from: publicKey,
		functionSignature: functionSignature,
	}

	let dataToSign = {
		types: {
			EIP712Domain: domainType,
			MetaTransaction: metaTransactionType,
		},
		domain: domainData,
		primaryType: "MetaTransaction",
		message: message,
	}

	let signature = sigUtil.signTypedData(
		new Buffer.from(privateKey.substring(2, 66), "hex"),
		{ data: dataToSign },
		"V3"
	)

	let r = signature.slice(0, 66)
	let s = "0x".concat(signature.slice(66, 130))
	let v = "0x".concat(signature.slice(130, 132))
	v = ethers.BigNumber.from(v).toNumber()
	if (![27, 28].includes(v)) v += 27

	return {
		r,
		s,
		v,
	}
}

describe("Test Contract", async () => {
	let testContractFactory,
		testContract,
		metaTransactionContractFactory,
		metaTransactionContract,
		testContractInterface

	before("before test", async () => {
		testContractFactory = await ethers.getContractFactory("TestContract")
		testContract = await testContractFactory.deploy()
		await testContract.deployed()

		testContractInterface = new ethers.utils.Interface(TestABI.abi)

		metaTransactionContractFactory = await ethers.getContractFactory(
			"EIP712MetaTransaction"
		)
		metaTransactionContract = await metaTransactionContractFactory.deploy(
			"TestContract",
			"1"
		)
		await metaTransactionContract.deployed()

		domainData = {
			name: "TestContract",
			version: "1",
			verifyingContract: testContract.address,
			salt: ethers.utils.hexZeroPad(
				ethers.BigNumber.from(1337).toHexString(),
				32
			),
		}
	})

	it("Should be able to send transaction successfully", async () => {
		let nonce = await testContract.getNonce(publicKey)

		let functionSignature = testContractInterface.encodeFunctionData(
			"setQuote",
			["Metatx"]
		)

		const { r, s, v } = await getTXData(nonce, functionSignature)

		let tx = await testContract.executeMetaTransaction(
			publicKey,
			functionSignature,
			r,
			s,
			v
		)

		await tx.wait(1)

		console.log("Transaction hash : ", tx.hash)

		let newNonce = await testContract.getNonce(publicKey)

		assert.isTrue(newNonce.toNumber() == nonce + 1, "Nonce not incremented")
	})
})

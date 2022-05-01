require("@nomiclabs/hardhat-waffle")
require("dotenv").config()

const kovanUrl = process.env.ALCHEMY_KOVAN_URL
	? process.env.ALCHEMY_KOVAN_URL
	: ""

module.exports = {
	solidity: "0.8.10",
	networks: {
		hardhat: {
			chainId: 1337,
		},
		kovan: {
			url: kovanUrl,
			accounts:
				process.env.ACCOUNT_KEY !== undefined
					? [process.env.ACCOUNT_KEY]
					: [],
			timeout: 1000000,
		},
	},
}

let config = {};
config.contract = {
    address: "0x1DF93B3553BFBed938BB0617FBE20eB9b6B6f793",
    abi: [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "newQuote",
                    "type": "string"
                }
            ],
            "name": "setQuote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "forwarder",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getQuote",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "currentQuote",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "currentOwner",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "forwarder",
                    "type": "address"
                }
            ],
            "name": "isTrustedForwarder",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "quote",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "trustedForwarder",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "versionRecipient",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

config.daiAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
config.usdtAddress = "0x7816604Da30cFb779Cd0F113E748238033710bAa";
config.usdcAddress = "0xA5d2a43d94B6a26054506D18ea44E4749f727721";
config.feeProxyAddress = "0x5d65e95D5Db68ccF009A3a5e7153b85780BE30DE";

module.exports = {config}

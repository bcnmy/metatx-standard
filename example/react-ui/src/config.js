let config = {};
config.contract = {
    address: "0xCb7ECa3cd58Ef49F164F58D77C8A56ddDdfF5FA1",
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
config.usdtAddress = "0x8e1084f3599ba90991C3b2f9e25D920738C1496D";
config.usdcAddress = "0x6043fD7126e4229d6FcaC388c9E1C8d333CCb8fA";
config.usdtAddress = "0x8e1084f3599ba90991C3b2f9e25D920738C1496D";
config.feeProxyAddress = "0x90a04073fD94B67Ebe83AAf0D0B6cbA4e0bB8A4B";

module.exports = {config}

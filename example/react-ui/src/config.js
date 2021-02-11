let config = {};
config.contract = {
    address: "0xE9A0b4d00A2BAAB2e9ef52773BF6918ea3f1fd0C",
    abi: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address payable",
                    "name": "relayerAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bytes",
                    "name": "functionSignature",
                    "type": "bytes"
                }
            ],
            "name": "MetaTransactionExecuted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_raceIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_horseIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                }
            ],
            "name": "createBet",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256[]",
                    "name": "_unicorns",
                    "type": "uint256[]"
                },
                {
                    "internalType": "uint256",
                    "name": "_startTime",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_expiryTime",
                    "type": "uint256"
                }
            ],
            "name": "createRace",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_raceIndex",
                    "type": "uint256"
                }
            ],
            "name": "evaluateRace",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "internalType": "bytes",
                    "name": "functionSignature",
                    "type": "bytes"
                },
                {
                    "internalType": "bytes32",
                    "name": "sigR",
                    "type": "bytes32"
                },
                {
                    "internalType": "bytes32",
                    "name": "sigS",
                    "type": "bytes32"
                },
                {
                    "internalType": "uint8",
                    "name": "sigV",
                    "type": "uint8"
                }
            ],
            "name": "executeMetaTransaction",
            "outputs": [
                {
                    "internalType": "bytes",
                    "name": "",
                    "type": "bytes"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getChainID",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "user",
                    "type": "address"
                }
            ],
            "name": "getNonce",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "nonce",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_raceIndex",
                    "type": "uint256"
                }
            ],
            "name": "getNumberOfBetsOnRace",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_raceIndex",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_horseIndex",
                    "type": "uint256"
                }
            ],
            "name": "getNumberOfBetsOnUnicorn",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getNumberOfRaces",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_raceIndex",
                    "type": "uint256"
                }
            ],
            "name": "getNumberOfUnicornsInRace",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "raceIndex",
                    "type": "uint256"
                }
            ],
            "name": "getRace",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                },
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "poolAmount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
}

config.contractWithBasicSign = {
    address: "0x1E1c36546F6ddD71e8e6aEDf135B82F7EEaA08b9",
    abi:[ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "userAddress", "type": "address" }, { "indexed": false, "internalType": "address payable", "name": "relayerAddress", "type": "address" }, { "indexed": false, "internalType": "bytes", "name": "functionSignature", "type": "bytes" } ], "name": "MetaTransactionExecuted", "type": "event" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": false, "inputs": [ { "internalType": "address", "name": "userAddress", "type": "address" }, { "internalType": "bytes", "name": "functionSignature", "type": "bytes" }, { "internalType": "bytes32", "name": "sigR", "type": "bytes32" }, { "internalType": "bytes32", "name": "sigS", "type": "bytes32" }, { "internalType": "uint8", "name": "sigV", "type": "uint8" } ], "name": "executeMetaTransaction", "outputs": [ { "internalType": "bytes", "name": "", "type": "bytes" } ], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getNonce", "outputs": [ { "internalType": "uint256", "name": "nonce", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "quote", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "internalType": "string", "name": "newQuote", "type": "string" } ], "name": "setQuote", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getQuote", "outputs": [ { "internalType": "string", "name": "currentQuote", "type": "string" }, { "internalType": "address", "name": "currentOwner", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" } ]
}

module.exports = {config}

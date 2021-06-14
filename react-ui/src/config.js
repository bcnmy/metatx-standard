let config = {};
config.contract = {
  address: "0x42a95596b70deec38b03a419f1a11a7408938e06",
  abi: [
    {
      constant: false,
      inputs: [
        {
          internalType: "address",
          name: "userAddress",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "functionSignature",
          type: "bytes",
        },
        {
          internalType: "bytes32",
          name: "sigR",
          type: "bytes32",
        },
        {
          internalType: "bytes32",
          name: "sigS",
          type: "bytes32",
        },
        {
          internalType: "uint8",
          name: "sigV",
          type: "uint8",
        },
      ],
      name: "executeMetaTransaction",
      outputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      payable: true,
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "userAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address payable",
          name: "relayerAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "functionSignature",
          type: "bytes",
        },
      ],
      name: "MetaTransactionExecuted",
      type: "event",
    },
    {
      constant: false,
      inputs: [
        {
          internalType: "string",
          name: "newQuote",
          type: "string",
        },
      ],
      name: "setQuote",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getNonce",
      outputs: [
        {
          internalType: "uint256",
          name: "nonce",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "getQuote",
      outputs: [
        {
          internalType: "string",
          name: "currentQuote",
          type: "string",
        },
        {
          internalType: "address",
          name: "currentOwner",
          type: "address",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "quote",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ],
};

config.baseURL = "https://api.biconomy.io";

module.exports = { config };

const { ethers } = require("hardhat");
const { Contract } = ethers;

const TestArtifacts = require("../artifacts/contracts/Test.sol/Test.json");

const web3Abi = require("web3-eth-abi");
const sigUtil = require("eth-sig-util");

const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
  {
    name: "chainId",
    type: "uint256",
  },
];

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];

async function MetaTransaction(
  signerAddress, // : string,
  smartContractAddress, // : string,
  functionName, // : string,
  functionParameters // : any[]
) {
  // * get provider like : Alchemy, Infura, local provider.
  const provider = ethers.provider;

  const functionAbi = getFunctionAbi(TestArtifacts.abi, functionName);

  const smartContract = new Contract(
    smartContractAddress,
    TestArtifacts.abi,
    provider
  );

  const smartContractName = await smartContract.name();
  const nonce = await smartContract.getNonce(signerAddress);

  const domainData = {
    name: smartContractName,
    version: "1",
    verifyingContract: smartContractAddress,
    chainId: 31337,
  };

  const { r, s, v, functionSignature } = await getTransactionData(
    domainData,
    nonce,
    functionAbi,
    functionParameters
  );

  const MetaTransactionABI = [
    "function executeMetaTransaction(address userAddress, bytes memory functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV)",
  ];

  const iface = new ethers.utils.Interface(MetaTransactionABI);
  const sendTransactionData = iface.encodeFunctionData(
    "executeMetaTransaction",
    [signerAddress, functionSignature, r, s, v]
  );

  // * get treasury (Account 0) address to sign this transaction on behalf all users.
  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const signer = wallet.connect(provider);

  const tx = {
    to: smartContractAddress,
    value: 0,
    from: signer.address,
    gasLimit: ethers.utils.hexlify(4000000),

    // gasPrice: ethers.utils.hexlify(parseInt('500000000000')),
    data: sendTransactionData,
  };

  try {
    await signer.sendTransaction(tx);
  } catch (err) {
    throw new Error(err);
  }
}

async function getTransactionData(
  domainData, // : any,
  nonce, // : number,
  functionAbi, // : any,
  params // : any
) {
  const functionSignature = web3Abi.encodeFunctionCall(functionAbi, params);

  const message = {
    nonce: parseInt(nonce.toString()),
    from: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", // Account 1 public key
    functionSignature,
  };

  const dataToSign = {
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message,
  };

  const signature = sigUtil.signTypedData_v4(
    Buffer.from(
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d".substring(
        2,
        66
      ), //  Account 1 private key
      "hex"
    ),
    {
      data: dataToSign,
    }
  );

  const r = signature.slice(0, 66);
  const s = "0x".concat(signature.slice(66, 130));
  const unparsedV = "0x".concat(signature.slice(130, 132));
  let v = Number(unparsedV.toString());
  if (![27, 28].includes(v)) v += 27;

  return {
    r,
    s,
    v,
    functionSignature,
  };
}

function getFunctionAbi(abi, /*: any */ functionName /*: string: */) {
  const functionAbi = abi.filter((obj /*: any */) => {
    return functionName === obj.name;
  });

  if (functionAbi === undefined) {
    throw new Error("Function not found!");
  }

  return functionAbi[0];
}

// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

// Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
// Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
module.exports = {
  MetaTransaction,
};

// npx hardhat test --network hardhat

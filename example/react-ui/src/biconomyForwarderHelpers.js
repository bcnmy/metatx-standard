import {ethers} from 'ethers';
const {config} = require("./config");
const abi = require("ethereumjs-abi");
let helperAttributes = {};
let supportedNetworks = [42];
helperAttributes.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// any other constants needed goes in helperAttributes

let biconomyForwarderAddressMap = {};

// Kovan
biconomyForwarderAddressMap[42] = "0x656a7B1B1E4525dB80bca5e80F4777F4b0C599b7";

helperAttributes.biconomyForwarderAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"},{"indexed":false,"internalType":"bytes","name":"returnData","type":"bytes"},{"indexed":false,"internalType":"address","name":"feeProxy","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"txGas","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"ForwardedTx","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"highestBatchId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];

helperAttributes.biconomyForwarderDomainData = {
    name : "TEST", //todo 
    version : "1",
  };

helperAttributes.domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

helperAttributes.forwardRequestType = [
    {name:'from',type:'address'},
    {name:'to',type:'address'},
    {name:'token',type:'address'},
    {name:'txGas',type:'uint256'},
    {name:'tokenGasPrice',type:'uint256'},
    {name:'batchId',type:'uint256'},
    {name:'batchNonce',type:'uint256'},
    {name:'deadline',type:'uint256'},
    {name:'data',type:'bytes'}
  ];

// pass the networkId and provider to get biconomy forwarder instance and populate domain data
const getBiconomyForwarder = async (provider, networkId) => {
        //get trusted forwarder contract address from network id
        const forwarderAddress = biconomyForwarderAddressMap[networkId];
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const forwarder = new ethers.Contract(forwarderAddress, helperAttributes.biconomyForwarderAbi, signer);
        return forwarder;
};

const buildForwardTxRequest = async ({account, to, gasLimitNum, batchId, batchNonce, data, deadline}) => {
    const req = {
        from: account,
        to: to,
        token: helperAttributes.ZERO_ADDRESS,
        txGas: gasLimitNum,
        tokenGasPrice: "0",
        batchId: parseInt(batchId),
        batchNonce: parseInt(batchNonce),
        deadline: deadline || Math.floor(Date.now() / 1000 + 3600),
        data: data
    };
    return req;
};

const getDataToSignForEIP712 = (request,networkId) => {
    const forwarderAddress = biconomyForwarderAddressMap[networkId];
    let domainData = helperAttributes.biconomyForwarderDomainData;
    domainData.chainId = networkId;
    domainData.verifyingContract = forwarderAddress;

    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: helperAttributes.domainType,
            ERC20ForwardRequest: helperAttributes.forwardRequestType
        },
        domain: domainData,
        primaryType: "ERC20ForwardRequest",
        message: request
    });
    return dataToSign;
}

const getDataToSignForPersonalSign = (request) => {
    const hashToSign = abi.soliditySHA3([
        "address",
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "bytes32",
    ], [
        request.from,
        request.to,
        request.token,
        request.txGas,
        request.tokenGasPrice,
        request.batchId,
        request.batchNonce,
        request.deadline,
        ethers.utils.keccak256(request.data),
    ]);
    return hashToSign;
}

const getDomainSeperator = (networkId) => {
    const forwarderAddress = biconomyForwarderAddressMap[networkId];
    let domainData = helperAttributes.biconomyForwarderDomainData;
    domainData.chainId = networkId;
    domainData.verifyingContract = forwarderAddress;

    const domainSeparator = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([
        "bytes32",
        "bytes32",
        "bytes32",
        "uint256",
        "address"
    ], [
        ethers.utils.id("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        ethers.utils.id(domainData.name),
        ethers.utils.id(domainData.version),
        domainData.chainId,
        domainData.verifyingContract,
    ]));
    return domainSeparator;
};

export {
    helperAttributes,
    biconomyForwarderAddressMap,
    getDomainSeperator,
    getDataToSignForPersonalSign,
    getDataToSignForEIP712,
    buildForwardTxRequest,
    getBiconomyForwarder
};
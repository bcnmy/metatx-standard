import {ethers} from 'ethers';
const {config} = require("./config");
let helperAttributes = {};
helperAttributes.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// any other constants needed goes in helperAttributes

helperAtttributes.biconomyForwarderDomainData = {
    name : "TEST",
    version : "1",
  };

// pass the networkId to get biconomy forwarder instance and populate domain data
const getBiconomyForwarder = async (networkId) => {
     //get trusted forwarder contract address from network id
     helperAttributes.biconomyForwarderDomainData.chainId = networkId;

};

const buildForwardTxRequest = async (account, to, gasLimitNum, data, biconomyForwarder, newBatch = false) => {
    const batchId = newBatch ? await biconomyForwarder.methods.getBatch(userAddress).call() : 0;
    const batchNonce = await biconomyForwarder.methods.getNonce(account, batchId).call();
    const req = {
        from: account,
        to: to,
        token: ZERO_ADDRESS,
        txGas: gasLimitNum,
        tokenGasPrice: "0",
        batchId: batchId,
        batchNonce: parseInt(batchNonce),
        deadline: Math.floor(Date.now() / 1000 + 3600),
        data: data
    };
    return {request: req};
};

const getDataToSignForEIP712 = (request) => {
    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            ERC20ForwardRequest: forwardRequestType
        },
        domain: biconomyForwarderDomainData,
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
        ethers.utils.keccak256(req.data),
    ]);
    return hashToSign;
}

const getDomainSeperator = (biconomyForwarderDomainData) => {
    const domainSeparator = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([
        "bytes32",
        "bytes32",
        "bytes32",
        "uint256",
        "address"
    ], [
        ethers.utils.id("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        ethers.utils.id(biconomyForwarderDomainData.name),
        ethers.utils.id(biconomyForwarderDomainData.version),
        biconomyForwarderDomainData.chainId,
        biconomyForwarderDomainData.verifyingContract,
    ]));
    return domainSeparator;
};

module.exports = {
    helperAttributes,
    getDomainSeperator,
    getDataToSignForPersonalSign,
    getDataToSignForEIP712,
    buildForwardTxRequest,
    getBiconomyForwarder
}
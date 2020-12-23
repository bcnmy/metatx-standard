import { ethers } from "ethers";
const abi = require("ethereumjs-abi");
const { config } = require("./config"); //remove config and hardcode biconomy API
let helperAttributes = {};
let supportedNetworks = [42];
helperAttributes.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
helperAttributes.baseURL = "https://api.biconomy.io";
let daiTokenAddressMap = {},
  usdtTokenAddressMap = {},
  usdcTokenAddressMap = {},
  biconomyForwarderAddressMap = {},
  oracleAggregatorAddressMap = {},
  erc20FeeProxyAddressMap = {};

//Kovan
daiTokenAddressMap[42] = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
biconomyForwarderAddressMap[42] = "0x656a7B1B1E4525dB80bca5e80F4777F4b0C599b7";
erc20FeeProxyAddressMap[42] = "0xFd5EEb7D07f37090ed3bD08E6B1FBC0E21C52FEF";
oracleAggregatorAddressMap[42] = "0x025d39AA202A552487ac9282dC343773cb60bbB5";

// any other constants needed goes in helperAttributes

helperAttributes.biconomyForwarderDomainData = {
    name : "TEST", // Biconomy Transaction
    version : "1",
  };

helperAttributes.daiDomainData = {
    name : "Dai Stablecoin",
    version : "1",
  };

helperAttributes.domainType = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

helperAttributes.daiPermitType = [
    { name: "holder", type: "address" },
    { name: "spender", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "expiry", type: "uint256" },
    { name: "allowed", type: "bool" }
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

  helperAttributes.oracleAggregatorAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"ethGasPrice","type":"uint256"}],"name":"getTokenGasPrice","outputs":[{"internalType":"uint256","name":"tokenGasPriceUnadjusted","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenOracleDecimals","outputs":[{"internalType":"uint8","name":"_tokenOracleDecimals","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenPrice","outputs":[{"internalType":"uint256","name":"tokenPriceUnadjusted","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"callAddress","type":"address"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bool","name":"signed","type":"bool"}],"name":"setTokenOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  helperAttributes.transferHandlerAbi = [{"inputs":[{"internalType":"address","name":"_forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"trustedForwarder","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"versionRecipient","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
  helperAttributes.feeProxyAbi = [{"inputs":[{"internalType":"uint256","name":"_transferHandlerGas","type":"uint256"},{"internalType":"address","name":"_feeReceiver","type":"address"},{"internalType":"address","name":"_feeManager","type":"address"},{"internalType":"addresspayable","name":"_forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"charge","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"FeeCharged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"feeManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forwarder","outputs":[{"internalType":"addresspayable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oracleAggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeManager","type":"address"}],"name":"setFeeManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"}],"name":"setFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"oa","type":"address"}],"name":"setOracleAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_transferHandlerGas","type":"uint256"}],"name":"setTransferHandlerGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"transferHandlerGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  helperAttributes.biconomyForwarderAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"},{"indexed":false,"internalType":"bytes","name":"returnData","type":"bytes"},{"indexed":false,"internalType":"address","name":"feeProxy","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"txGas","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"ForwardedTx","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"highestBatchId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
  helperAttributes.daiAbi = [{"inputs":[{"internalType":"uint256","name":"chainId_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"guy","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"internalType":"bytes4","name":"sig","type":"bytes4"},{"indexed":true,"internalType":"address","name":"usr","type":"address"},{"indexed":true,"internalType":"bytes32","name":"arg1","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"arg2","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"deny","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"rely","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
  helperAttributes.feeManagerAbi = [{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"token","type":"address"}],"name":"getFeeMultiplier","outputs":[{"internalType":"uint16","name":"basisPoints","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenAllowed","outputs":[{"internalType":"bool","name":"allowed","type":"bool"}],"stateMutability":"view","type":"function"}];
  //todo
  //add new tokens

// pass the networkId to get biconomy forwarder instance and populate domain data
const getBiconomyForwarder = (provider,networkId) => {
     //get trusted forwarder contract address from network id
     const forwarderAddress = biconomyForwarderAddressMap[networkId];
     const ethersProvider = new ethers.providers.Web3Provider(provider);
     const signer = ethersProvider.getSigner();
     const forwarder = new ethers.Contract(forwarderAddress, helperAttributes.biconomyForwarderAbi, signer);
     return forwarder;
};

// pass the networkId to get gas price
const getGasPrice = async (networkId) => {
    const apiInfo = `${
        helperAttributes.baseURL
    }/api/v1/gas-price?networkId=${networkId}`;
    const response = await fetch(apiInfo);
    const responseJson = await response.json();
    console.log("Response JSON " + JSON.stringify(responseJson));
    return ethers.utils.parseUnits(responseJson.gasPrice.value.toString(), "gwei").toString();
  };
  
  
const getTokenGasPrice = async (provider, networkId, tokenAddress) => {
    const gasPrice = ethers.BigNumber.from(await getGasPrice(networkId));
    const oracleAggregatorAddress = oracleAggregatorAddressMap[networkId];
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const oracleAggregator = new ethers.Contract(oracleAggregatorAddress, helperAttributes.oracleAggregatorAbi, signer);
    const tokenPrice = await oracleAggregator.getTokenPrice(tokenAddress);
    const tokenOracleDecimals = await oracleAggregator.getTokenOracleDecimals(tokenAddress);
    return gasPrice.mul(ethers.BigNumber.from(10).pow(tokenOracleDecimals)).div(tokenPrice).toString();
  }


// rather than multiple parameters get the object  
// deadLine optional paramter and default value inside 
const buildForwardTxRequest = async (provider,networkId,{account, to, gasLimitNum, batchId, batchNonce, tokenGasPrice, data, token}) => {

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    const oracleAggregatorAddress = oracleAggregatorAddressMap[networkId];
    const oracleAggregator = new ethers.Contract(oracleAggregatorAddress, helperAttributes.oracleAggregatorAbi, signer);
    const tokenOracleDecimals = await oracleAggregator.getTokenOracleDecimals(token);
    const feeProxyAddress = erc20FeeProxyAddressMap[networkId];
    const feeProxy = new ethers.Contract(feeProxyAddress, helperAttributes.feeProxyAbi, signer);
    const feeManagerAddress = await feeProxy.feeManager();
    const feeManager = new ethers.Contract(feeManagerAddress, helperAttributes.feeManagerAbi, signer);
    const feeMultiplier = await feeManager.getFeeMultiplier(account, token);
    const transferHandlerGas = await feeProxy.transferHandlerGas();

    const req = {
        from: account,
        to: to,
        token: token,
        txGas: gasLimitNum,
        tokenGasPrice: tokenGasPrice,
        batchId: batchId,
        batchNonce: parseInt(batchNonce),
        deadline: Math.floor(Date.now() / 1000 + 3600),  // deadline user may provide?
        data: data
    };

    let cost = ethers.BigNumber.from(req.txGas.toString())
        .add(transferHandlerGas)
        .mul(ethers.BigNumber.from(req.tokenGasPrice))
        .mul(ethers.BigNumber.from(feeMultiplier.toString()))
        .div(ethers.BigNumber.from(10000));

    cost = (parseFloat(cost)/parseFloat(ethers.BigNumber.from(10).pow(tokenOracleDecimals))).toFixed(2);
    let fee = parseFloat(cost.toString()); // Exact amount in tokens
        
    return {request: req, cost: fee};
};

// make this method independently callable 
const getDataToSignForEIP712 = (request, networkId) => {
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

// get networkId based values here
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

const getDaiPermit = async(provider,account,daiPermitOptions) => {

    const spender = daiPermitOptions.spender;
    const expiry = daiPermitOptions.expiry;
    const allowed = daiPermitOptions.allowed;
    const chainId = daiPermitOptions.networkId;
    const daiDomainData = helperAttributes.daiDomainData;
    daiDomainData.verifyingContract = daiTokenAddressMap[chainId];
    daiDomainData.chainId = chainId;
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const dai = new ethers.Contract(daiDomainData.verifyingContract, helperAttributes.daiAbi, signer);
    const nonce = await dai.nonces(account);
    const permitDataToSign = {
        types: {
            EIP712Domain: helperAttributes.domainType,
            Permit: helperAttributes.daiPermitType
        },
        domain: daiDomainData,
        primaryType: "Permit",
        message: {
            holder: account,
            spender: spender,
            nonce: parseInt(nonce),
            expiry: parseInt(expiry),
            allowed: true
        }
    };
    const result = await ethersProvider.send("eth_signTypedData_v4", [account, JSON.stringify(permitDataToSign),]);
    console.log("success", result);
    const signature = result.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
    await dai.permit(account, spender, parseInt(nonce), parseInt(expiry.toString()), allowed, v, r, s);

}

export {
    helperAttributes,
    getDomainSeperator,
    erc20FeeProxyAddressMap,
    getDataToSignForPersonalSign,
    getDataToSignForEIP712,
    buildForwardTxRequest,
    getBiconomyForwarder,
    getTokenGasPrice,
    getDaiPermit
};
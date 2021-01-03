import { ethers } from "ethers";
const abi = require("ethereumjs-abi");
let helperAttributes = {};
let supportedNetworks = [42];
helperAttributes.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const FORWARD_OVERHEAD_PERSONAL_SIGN = 26231;
const FORWARD_OVERHEAD_EIP712_SIGN = 27796;
helperAttributes.baseURL = "https://api.biconomy.io";
let daiTokenAddressMap = {},
  usdtTokenAddressMap = {},
  usdcTokenAddressMap = {},
  biconomyForwarderAddressMap = {},
  oracleAggregatorAddressMap = {},
  erc20FeeProxyAddressMap = {};

//Kovan
daiTokenAddressMap[42] = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
biconomyForwarderAddressMap[42] = "0x46a7Aa64578F40F34CdC63c96E5340B6be1f7bba";
erc20FeeProxyAddressMap[42] = "0x966445784b8dd7a925794D35e335B2dd80C458A7";
oracleAggregatorAddressMap[42] = "0x6d04923945026711e42ebEA03C616e4E6BbF406e";
usdcTokenAddressMap[42] = "0xA5d2a43d94B6a26054506D18ea44E4749f727721";
usdtTokenAddressMap[42] = "0x8486E3592CC23F27Ea430aDAD031Cf8ABD978756";

// any other constants needed goes in helperAttributes
helperAttributes.biconomyForwarderDomainData = {
    name : "TEST", // Biconomy Transaction
    version : "1",
  };

helperAttributes.daiDomainData = {
    name : "Dai Stablecoin",
    version : "1",
  };

helperAttributes.usdcDomainData = {
    name : "USDC Coin",
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

helperAttributes.eip2612PermitType = [
	{ name: "owner", type: "address" },
	{ name: "spender", type: "address" },
	{ name: "value", type: "uint256" },
	{ name: "nonce", type: "uint256" },
	{ name: "deadline", type: "uint256" },
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
  helperAttributes.feeProxyAbi = [{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"},{"internalType":"address","name":"_feeManager","type":"address"},{"internalType":"addresspayable","name":"_forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"charge","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"FeeCharged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"feeManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forwarder","outputs":[{"internalType":"addresspayable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oracleAggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"safeTransferRequired","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_feeManager","type":"address"}],"name":"setFeeManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"}],"name":"setFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"oa","type":"address"}],"name":"setOracleAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"bool","name":"_safeTransferRequired","type":"bool"}],"name":"setSafeTransferRequired","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"_transferHandlerGas","type":"uint256"}],"name":"setTransferHandlerGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"transferHandlerGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
  helperAttributes.biconomyForwarderAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"},{"indexed":false,"internalType":"bytes","name":"returnData","type":"bytes"},{"indexed":false,"internalType":"address","name":"feeProxy","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"txGas","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"ForwardedTx","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"highestBatchId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
  helperAttributes.daiAbi = [{"inputs":[{"internalType":"uint256","name":"chainId_","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"guy","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"internalType":"bytes4","name":"sig","type":"bytes4"},{"indexed":true,"internalType":"address","name":"usr","type":"address"},{"indexed":true,"internalType":"bytes32","name":"arg1","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"arg2","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"src","type":"address"},{"indexed":true,"internalType":"address","name":"dst","type":"address"},{"indexed":false,"internalType":"uint256","name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"deny","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"holder","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"bool","name":"allowed","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"rely","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
  helperAttributes.feeManagerAbi = [{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"token","type":"address"}],"name":"getFeeMultiplier","outputs":[{"internalType":"uint16","name":"basisPoints","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenAllowed","outputs":[{"internalType":"bool","name":"allowed","type":"bool"}],"stateMutability":"view","type":"function"}];
  helperAttributes.usdtAbi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}];
  helperAttributes.erc20Eip2612Abi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
  helperAttributes.usdcAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

/**
 * Returns ABI and contract address based on network Id
 * You can build biconomy forwarder contract object using above values and calculate the nonce
 * @param {*} networkId 
 */  
const getBiconomyForwarderConfig = async (networkId) => {
     //get trusted forwarder contract address from network id
     const forwarderAddress = biconomyForwarderAddressMap[networkId];
     return {abi: helperAttributes.biconomyForwarderAbi, address: forwarderAddress};
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
  
  
const getTokenGasPrice = async (networkId, tokenAddress) => {
    const ethersProvider = ethers.getDefaultProvider(networkId);
    const gasPrice = ethers.BigNumber.from(await getGasPrice(networkId));
    const oracleAggregatorAddress = oracleAggregatorAddressMap[networkId];
    const oracleAggregator = new ethers.Contract(oracleAggregatorAddress, helperAttributes.oracleAggregatorAbi, ethersProvider);
    const tokenPrice = await oracleAggregator.getTokenPrice(tokenAddress);
    const tokenOracleDecimals = await oracleAggregator.getTokenOracleDecimals(tokenAddress);
    return gasPrice.mul(ethers.BigNumber.from(10).pow(tokenOracleDecimals)).div(tokenPrice).toString();
  }


/**
 * pass the below params in any order e.g. account=<account>,batchNone=<batchNone>,...
 * @param {*}  account - from (end user's) address for this transaction 
 * @param {*}  to - target recipient contract address
 * @param {*}  gasLimitNum - gas estimation of your target method in numeric format
 * @param {*}  batchId - batchId 
 * @param {*}  batchNonce - batchNonce which can be verified and obtained from the biconomy forwarder
 * @param {*}  tokenGasPrice - token gas price calculated based on tokenAddress using method getTokenGasPrice() 
 * @param {*}  data - functionSignature of target method
 * @param {*}  deadline - optional deadline for this forward request 
 * @param {*}  tokenAddress - ERC20 token address for your provider network Id. This token that will be paid for this transaction
 */
const buildForwardTxRequest = async (networkId,{account, to, gasLimitNum, batchId, batchNonce, tokenGasPrice, data, deadline, tokenAddress}) => {
    const ethersProvider = ethers.getDefaultProvider(networkId); // or infura provider 
    const oracleAggregatorAddress = oracleAggregatorAddressMap[networkId];
    const oracleAggregator = new ethers.Contract(oracleAggregatorAddress, helperAttributes.oracleAggregatorAbi, ethersProvider);
    const tokenOracleDecimals = await oracleAggregator.getTokenOracleDecimals(tokenAddress);
    const feeProxyAddress = erc20FeeProxyAddressMap[networkId];
    const feeProxy = new ethers.Contract(feeProxyAddress, helperAttributes.feeProxyAbi, ethersProvider);
    const feeManagerAddress = await feeProxy.feeManager();
    const feeManager = new ethers.Contract(feeManagerAddress, helperAttributes.feeManagerAbi, ethersProvider);
    const feeMultiplier = await feeManager.getFeeMultiplier(account, tokenAddress);
    const transferHandlerGas = await feeProxy.transferHandlerGas(tokenAddress);

    const req = {
        from: account,
        to: to,
        token: tokenAddress,
        txGas: gasLimitNum,
        tokenGasPrice: tokenGasPrice,
        batchId: batchId,
        batchNonce: parseInt(batchNonce),
        deadline: deadline || Math.floor(Date.now() / 1000 + 3600),  // deadline is optional user may provide
        data: data
    };

    let cost = ethers.BigNumber.from(req.txGas.toString())
        .add(ethers.BigNumber.from(FORWARD_OVERHEAD_EIP712_SIGN.toString())) // estimate on the higher end
        .add(transferHandlerGas)
        .mul(ethers.BigNumber.from(req.tokenGasPrice))
        .mul(ethers.BigNumber.from(feeMultiplier.toString()))
        .div(ethers.BigNumber.from(10000));

    cost = (parseFloat(cost)/parseFloat(ethers.BigNumber.from(10).pow(tokenOracleDecimals))).toFixed(2);
    let fee = parseFloat(cost.toString()); // Exact amount in tokens
        
    return {request: req, cost: fee};
};

/**
 * pass your forward request and network Id 
 * use this method to build message to be signed by end user in EIP712 signature format 
 * @param {*} request - forward request object
 * @param {*} networkId 
 */
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

/**
 * pass your forward request
 * use this method to build message to be signed by end user in personal signature format 
 * @param {*} networkId 
 */
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

/**
 * get the domain seperator that needs to be passed while using EIP712 signature type
 * @param {*} networkId 
 */
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

/**
 * @param {*} provider - provider with accounts (from window object or running ethereum node)
 * @param {*} account - end user address who is holder of the tokens
 * @param {*} daiPermitOptions - users can optionally pass spender, deadline and allowed fields. networkId is mandatory
 */
const getDaiPermit = async(provider,account,daiPermitOptions) => {

    let ethersProvider;
    // here provider could be web3 provider http/ws/window object OR ethers provider (default,jsonRpc or API provider) 
    if(provider._isProvider)
    {
        //already an ethersProvider - do nothing!
        ethersProvider = provider;
    }
    else
    {
        //any web3 provider
        ethersProvider = new ethers.providers.Web3Provider(provider); 
    }

    const signer = ethersProvider.getSigner();

    let signerOrProvider = signer;
    let isSignerWithAccounts = true;
    try {
        await signer.getAddress();
    } catch(error) {
        console.log("Given provider does not have accounts information");
        signerOrProvider = ethersProvider;
        isSignerWithAccounts = false;
    }

    const spender = daiPermitOptions.spender || erc20FeeProxyAddressMap[daiPermitOptions.networkId];
    const expiry = daiPermitOptions.expiry || Math.floor(Date.now() / 1000 + 3600);
    const allowed = daiPermitOptions.allowed || true;
    const chainId = daiPermitOptions.networkId;

    const daiDomainData = helperAttributes.daiDomainData;
    daiDomainData.verifyingContract = daiTokenAddressMap[chainId];
    daiDomainData.chainId = chainId;   

    const dai = new ethers.Contract(daiDomainData.verifyingContract, helperAttributes.daiAbi, signerOrProvider);
    const nonce = await dai.nonces(account);

    console.log(nonce);
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

//todo 
//add USDC like token permit support code example in app.js (different tokens in different repo for erc forwarder)

/**
 * @param {*} provider - provider with accounts (from window object or running ethereum node)
 * @param {*} account - end user address who is holder of the tokens
 * @param {*} daiPermitOptions - users can optionally pass spender, deadline and allowed fields. networkId is mandatory
 */
const getEip2612Permit = async(provider,account,permitOptions) => {
    let ethersProvider;
    // here provider could be web3 provider http/ws/window object OR ethers provider (default,jsonRpc or API provider) 
    if(provider._isProvider)
    {
        //already an ethersProvider - do nothing!
        ethersProvider = provider;
    }
    else
    {
        //any web3 provider
        ethersProvider = new ethers.providers.Web3Provider(provider); 
    }

    const signer = ethersProvider.getSigner();

    let signerOrProvider = signer;
    let isSignerWithAccounts = true;
    try {
        await signer.getAddress();
    } catch(error) {
        console.log("Given provider does not have accounts information");
        signerOrProvider = ethersProvider;
        isSignerWithAccounts = false;
    }

    const tokenDomainData = permitOptions.domainData;
    const spender = permitOptions.spender || erc20FeeProxyAddressMap[permitOptions.networkId];
    const value = permitOptions.value;
    const deadline = permitOptions.deadline || Math.floor(Date.now() / 1000 + 3600);
    
    const token = new ethers.Contract(tokenDomainData.verifyingContract, helperAttributes.erc20Eip2612Abi, signerOrProvider);
    const nonce = await token.nonces(account);
    const permitDataToSign = {
        types: {
            EIP712Domain: helperAttributes.domainType,
            Permit: helperAttributes.eip2612PermitType
        },
        domain: tokenDomainData,
        primaryType: "Permit",
        message: {
            owner: account,
            spender: spender,
            nonce: parseInt(nonce),
            value: value,
            deadline: parseInt(deadline)
        }
    };
    const result = await ethersProvider.send("eth_signTypedData_v4", [account, JSON.stringify(permitDataToSign),]);
    const signature = result.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
    await token.permit(account, spender, value, parseInt(deadline.toString()), v, r, s);
    
}



export {
    helperAttributes,
    erc20FeeProxyAddressMap,
    getDomainSeperator,
    getDataToSignForPersonalSign,
    getDataToSignForEIP712,
    buildForwardTxRequest,
    getBiconomyForwarderConfig,
    getTokenGasPrice,
    getDaiPermit,
    getEip2612Permit
};
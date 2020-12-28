let config = {};
config.contract = {
    address: "0x00371C560dA472d7ac898fF945a9b7f4CEa8BC84",
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


config.oracleAggregatorAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"ethGasPrice","type":"uint256"}],"name":"getTokenGasPrice","outputs":[{"internalType":"uint256","name":"tokenGasPriceUnadjusted","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenOracleDecimals","outputs":[{"internalType":"uint8","name":"_tokenOracleDecimals","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"getTokenPrice","outputs":[{"internalType":"uint256","name":"tokenPriceUnadjusted","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"callAddress","type":"address"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"bytes","name":"callData","type":"bytes"},{"internalType":"bool","name":"signed","type":"bool"}],"name":"setTokenOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
config.transferHandlerAbi = [{"inputs":[{"internalType":"address","name":"_forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"forwarder","type":"address"}],"name":"isTrustedForwarder","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"trustedForwarder","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"versionRecipient","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];
config.feeProxyAbi = [{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"},{"internalType":"address","name":"_feeManager","type":"address"},{"internalType":"addresspayable","name":"_forwarder","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"charge","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"FeeCharged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"feeManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeReceiver","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forwarder","outputs":[{"internalType":"addresspayable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oracleAggregator","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"safeTransferRequired","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_feeManager","type":"address"}],"name":"setFeeManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_feeReceiver","type":"address"}],"name":"setFeeReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"oa","type":"address"}],"name":"setOracleAggregator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"bool","name":"_safeTransferRequired","type":"bool"}],"name":"setSafeTransferRequired","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"_transferHandlerGas","type":"uint256"}],"name":"setTransferHandlerGas","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"transferHandlerGas","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
config.biconomyForwarderAbi = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"domainValue","type":"bytes"}],"name":"DomainRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"uint256","name":"batchId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"batchNonce","type":"uint256"},{"indexed":false,"internalType":"bool","name":"success","type":"bool"},{"indexed":false,"internalType":"bytes","name":"returnData","type":"bytes"},{"indexed":false,"internalType":"address","name":"feeProxy","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"txGas","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"ForwardedTx","type":"event"},{"inputs":[],"name":"EIP712_DOMAIN_TYPE","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"REQUEST_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"domains","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executeEIP712","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"executePersonalSign","outputs":[{"internalType":"bool","name":"success","type":"bool"},{"internalType":"bytes","name":"ret","type":"bytes"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"uint256","name":"batchId","type":"uint256"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"highestBatchId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"version","type":"string"}],"name":"registerDomainSeparator","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes32","name":"domainSeparator","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyEIP712","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"txGas","type":"uint256"},{"internalType":"uint256","name":"tokenGasPrice","type":"uint256"},{"internalType":"uint256","name":"batchId","type":"uint256"},{"internalType":"uint256","name":"batchNonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"structERC20ForwardRequestTypes.ERC20ForwardRequest","name":"req","type":"tuple"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"verifyPersonalSign","outputs":[],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];


config.biconomyForwarderAddress = "0x46a7Aa64578F40F34CdC63c96E5340B6be1f7bba";
config.tokenAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
config.feeProxyAddress = "0xd5120a36A8680A340d46931763C8E2d9487B1AF9";
config.transferHandlerAddress = "0x4AB0652B1049607F9E51E61144767d1C978950d0";
config.oracleAggregatorAddress = "0xa1095C06709Bbbb4a2B476ED0418d3B841a0Fec8";
config.ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = {config}

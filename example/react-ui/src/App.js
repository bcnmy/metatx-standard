import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {  helperAttributes,
  getDomainSeperator,
  getDataToSignForPersonalSign,
  getDataToSignForEIP712,
  buildForwardTxRequest,
  getBiconomyForwarderConfig,
  getTokenGasPrice,
  getDaiPermit} from "./erc20ForwarderHelpers";
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const abi = require("ethereumjs-abi");


let web3;
let contract;
let provider;
let ethersProvider;

const useStyles = makeStyles((theme) => ({
  root: {
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px"
  }
}));


//todo
//add cost calculation and access to fee manager, fee proxy and oracle aggregator read variables (like biconomy forwarder)
//review and easy permit flow

function App() {
  const classes = useStyles();
  const preventDefault = (event) => event.preventDefault();
  const [quote, setQuote] = useState("This is a default quote");
  const [owner, setOwner] = useState("Default Owner Address");
  const [newQuote, setNewQuote] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" &&
        window.ethereum.isMetaMask
      ) {
        // Ethereum user detected. You can now use the provider.
          provider = window["ethereum"];
          await provider.enable();

          //const biconomy = new Biconomy(provider,{apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209", debug: true});
          web3 = new Web3(provider);

            contract = new web3.eth.Contract(
              config.contract.abi,
              config.contract.address
            );

            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
      } else {
        showErrorMessage("Metamask not installed");
      }
    }
    init();
  }, []);

  const onQuoteChange = event => {
    setNewQuote(event.target.value);
  };

   /* this app does not need to use @biconomy/mexa */
   /* this example demonstrates paying DAI tokens as gas fees*/
  const onERCForwardWithEIP712Signature = async event => {
    if (newQuote != "" && contract) {
      setTransactionHash("");

      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;

        let data = contract.methods.setQuote(newQuote).encodeABI();
        let txGas = await contract.methods.setQuote(newQuote).estimateGas({from: userAddress});
        let networkId = 42;

        const daiPermitOptions = {
          spender: config.feeProxyAddress,
          expiry: Math.floor(Date.now() / 1000 + 3600),
          allowed: true,
          networkId: 42
        };

        await getDaiPermit(provider,userAddress,daiPermitOptions);
      
        let forwarder = await getBiconomyForwarderConfig(42);
        let forwarderContract = new web3.eth.Contract(
           forwarder.abi,
           forwarder.address
         );

        const batchNonce = await forwarderContract.methods.getNonce(userAddress,0).call();
        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        console.log(batchNonce);

        const tokGasPrice = await getTokenGasPrice(networkId,config.tokenAddress);
        
        let request = await buildForwardTxRequest(networkId,{account:userAddress,to:config.contract.address,gasLimitNum:Number(txGas),batchId:0,batchNonce,tokenGasPrice:tokGasPrice,data,tokenAddress:config.tokenAddress});
        const req = request.request;
        console.log(req);
        const cost = request.cost;
        console.log(`Your user will be paying ${cost} amount of tokens`);
      

        const domainSeparator = getDomainSeperator(networkId);

        console.log(domainSeparator);

        const dataToSign = getDataToSignForEIP712(req,networkId);

        const promi = new Promise(async function(resolve, reject) {
          await web3.currentProvider.send(
            {
              jsonrpc: "2.0",
              id: 999999999999,
              method: "eth_signTypedData_v4",
              params: [userAddress, dataToSign]
            }, function(error, res){
            if(error) {
              reject(error);
            } else {
              resolve(res.result);
            }
          });
        });

        promi.then(async function(sig){
          console.log('signature ' + sig);
          console.log(req);
          sendTransaction({userAddress, req, domainSeparator, sig, signatureType:"EIP712_SIGN"});
        }).catch(function(error) {
          console.log('could not get signature error ' + error);
          showErrorMessage("Could not get user signature");
        });

      } else {
        showErrorMessage("Meta Transaction disabled");
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };

  const onERCForwardWithPersonalSignature = async event => {
    if (newQuote != "" && contract) {
      setTransactionHash("");

      /**
       * create an instance of BiconomyForwarder <= ABI, Address
       * create functionSignature
       * create txGas param which is gas estimation of his function call
       * get nonce from biconomyForwarder instance
       * get gasPrice and tokenGasPrice (based on token address you wish to transact as gas)
       * get token address based on symbol? // pass the token address accoridng to provider's network id
       * create a forwarder request
       * create dataToSign as per signature scheme used (personal signature)
       * get the signature from user
       * create the domain separator
       * Now call the meta tx API with two parameters request and signature
       * */
       
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;

        let data = contract.methods.setQuote(newQuote).encodeABI();
        let txGas = await contract.methods.setQuote(newQuote).estimateGas({from: userAddress});
        let networkId = 42;
        
        const daiPermitOptions = {
          spender: config.feeProxyAddress,
          expiry: Math.floor(Date.now() / 1000 + 3600),
          allowed: true,
          networkId: networkId
        };

        await getDaiPermit(provider,userAddress,daiPermitOptions);
      
        let forwarder = await getBiconomyForwarderConfig(42);
        let forwarderContract = new web3.eth.Contract(
           forwarder.abi,
           forwarder.address
         );

        const batchNonce = await forwarderContract.methods.getNonce(userAddress,0).call();
        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        console.log(batchNonce);

        const tokGasPrice = await getTokenGasPrice(networkId,config.tokenAddress);

        let request = await buildForwardTxRequest(networkId,{account:userAddress,to:config.contract.address,gasLimitNum:Number(txGas),batchId:0,batchNonce,tokenGasPrice:tokGasPrice,data,tokenAddress:config.tokenAddress});
        const req = request.request;
        console.log(req);
        const cost = request.cost;
        console.log(cost);

        const hashToSign = getDataToSignForPersonalSign(req);

        const sig = await web3.eth.personal.sign("0x" + hashToSign.toString("hex"), userAddress);

        console.log('signature ' + sig);
        sendTransaction({userAddress, req, sig, signatureType:"PERSONAL_SIGN"});

      } else {
        showErrorMessage("Meta Transaction disabled");
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };


  /*const signMessage = async (addr, data) => {
    let signature;
    await web3.currentProvider.sendAsync(
      {
        jsonrpc: "2.0",
        id: 999999999999,
        method: "eth_signTypedData_v4",
        params: [addr, data]
      },
      function(error, response) {
        console.info(`User signature is ${response.result}`);
        if (error || (response && response.error)) {
          showErrorMessage("Could not get user signature");
        } else if (response && response.result) {
          signature = response.result;
          return signature;
        }
      }
    );
  }*/

  const sendTransaction = ({userAddress, req, sig, domainSeparator, signatureType}) => {
    if (web3 && contract) {
      let params;
      if(domainSeparator) {
          params = [req, domainSeparator, sig]
      } else {
          params = [req, sig]
      }
      try {
        fetch(`https://localhost:4000/api/v2/meta-tx/native`, {
          method: "POST",
          headers: {
            "x-api-key" : "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
            'Content-Type': 'application/json;charset=utf-8'
          },
          body: JSON.stringify({
            "to": config.contract.address,
            "apiId": "ca3c2a47-61ad-4e9e-bff3-1da0faeb69f5",
            "params": params,
            "from": userAddress,
            "signatureType": signatureType
          })
        })
        .then(response=>response.json())
        .then(function(result) {
          console.log(result);
          showInfoMessage(`Transaction sent by relayer with hash ${result.txHash}`);
          return result.txHash;
        })
        .then(function(hash){
          const receipt = fetchMinedTransactionReceipt(hash);
          return receipt;
        }).then(function(receipt){
          if(receipt)
          {
            console.log(receipt);
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed on chain");
            getQuoteFromNetwork();
          }  
        })
	      .catch(function(error) {
	        console.log(error)
	      });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchMinedTransactionReceipt = (transactionHash) => {

    return new Promise((resolve, reject) => {
      
      const { web3 } = window;
  
      var timer = setInterval(()=> {
        web3.eth.getTransactionReceipt(transactionHash, (err, receipt)=> {
          if(!err && receipt){
            clearInterval(timer);
            resolve(receipt);
          }
          else if(err)
          {
            reject(err);
          }
        });
      }, 2000)
     
    })
  }

  const getQuoteFromNetwork = () => {
    if (web3 && contract) {
      contract.methods
        .getQuote()
        .call()
        .then(function(result) {
          console.log(result);
          if (
            result &&
            result.currentQuote != undefined &&
            result.currentOwner != undefined
          ) {
            if (result.currentQuote == "") {
              showErrorMessage("No quotes set on blockchain yet");
            } else {
              setQuote(result.currentQuote);
              setOwner(result.currentOwner);
            }
          } else {
            showErrorMessage("Not able to get quote information from Network");
          }
        });
    }
  };

  const showErrorMessage = message => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = message => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = message => {
    NotificationManager.info(message, "Info", 3000);
  };

  return (
    <div className="App">
      <section className="main">
        <div className="mb-wrap mb-style-2">
          <blockquote cite="http://www.gutenberg.org/ebboks/11">
            <p>{quote}</p>
          </blockquote>
        </div>

        <div className="mb-attribution">
          <p className="mb-author">{owner}</p>
          {selectedAddress.toLowerCase() === owner.toLowerCase() && (
            <cite className="owner">You are the owner of the quote</cite>
          )}
          {selectedAddress.toLowerCase() !== owner.toLowerCase() && (
            <cite>You are not the owner of the quote</cite>
          )}
        </div>
      </section>
      <section>
        {transactionHash !== "" && <Box className={classes.root} mt={2} p={2}>
          <Typography>
            Check your transaction hash
            <Link href={`https://kovan.etherscan.io/tx/${transactionHash}/internal_transactions`} target="_blank"
            className={classes.link}>
              here
            </Link>
          </Typography>
        </Box>}
      </section>
      <section>
        <div className="submit-container">
          <div className="submit-row">
            <input
              type="text"
              placeholder="Enter your quote"
              onChange={onQuoteChange}
              value={newQuote}
            />
             <Button variant="contained" color="primary" onClick={onERCForwardWithEIP712Signature}>
              Submit with ERC20 Forwarder (EIP712 Sig)
            </Button>

            <Button variant="contained" color="primary" onClick={onERCForwardWithPersonalSignature}>
              Submit with ERC20 Forwarder (Personal Sig)
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;

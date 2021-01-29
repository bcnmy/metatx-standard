import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ethers } from "ethers";
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


let ethersProvider, signer;
let contract, contractInterface;
let provider, web3;
let ethersTestProvider;

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
          //console.log('window provider');
          //console.log(provider);
          await provider.enable();

          //web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

          //ethersTestProvider = new ethers.providers.JsonRpcProvider('https://kovan.infura.io/v3/4fc8c17e36ad4f85bc7bdce6e57ad06d');
          //console.log(ethersTestProvider);

          if (provider.networkVersion == "42") {
            //doStuff

           ethersProvider = new ethers.providers.Web3Provider(provider);



            signer = ethersProvider.getSigner();
  
            contract = new ethers.Contract(
              config.contract.address,
              config.contract.abi,
              signer
            );
  
            contractInterface = new ethers.utils.Interface(config.contract.abi);

            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            provider.on("accountsChanged", function(accounts) {
              setSelectedAddress(accounts[0]);
            });
          }
          else{
            showErrorMessage(
              "Please change the network in metamask to Kovan Testnet"
            );
          }
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

        let {data} = await contract.populateTransaction.setQuote(newQuote);
        //could also use below
        //let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);

        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
              to: config.contract.address,
              from: userAddress,
              data: data
            });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString()); 

        let networkId = 42;

        const daiPermitOptions = {
          spender: config.erc20ForwarderAddress,
          expiry: Math.floor(Date.now() / 1000 + 3600),
          allowed: true,
          networkId: 42
        };

        await getDaiPermit(provider,userAddress,daiPermitOptions);
      
        let forwarder = await getBiconomyForwarderConfig(42);
        let forwarderContract = new ethers.Contract(
          forwarder.address,
          forwarder.abi,
          signer
        );

        const batchNonce = await forwarderContract.getNonce(userAddress,0);
        //const batchId = await forwarderContract.getBatch(userAddress);
        console.log(batchNonce);

        const tokGasPrice = await getTokenGasPrice(networkId,config.tokenAddress);

        const gasLimitNum = Number(gasLimit.toNumber().toString());
        console.log(gasLimitNum);
        
        let request = await buildForwardTxRequest(networkId,{account:userAddress,to:config.contract.address,gasLimitNum,batchId:0,batchNonce,tokenGasPrice:tokGasPrice,data,tokenAddress:config.tokenAddress});
        const req = request.request;
        console.log(req);
        const cost = request.cost;
        console.log(`Your user will be paying ${cost} amount of tokens`);
      

        const domainSeparator = getDomainSeperator(networkId);

        console.log(domainSeparator);

        const dataToSign = getDataToSignForEIP712(req,networkId);

        ethersProvider.send("eth_signTypedData_v4", [userAddress, dataToSign])
        .then(function(sig){
          sendTransaction({userAddress, req, domainSeparator, sig, signatureType:"EIP712_SIGN"});
        })
        .catch(function(error) {
	        console.log(error)
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

        let {data} = await contract.populateTransaction.setQuote(newQuote);
        //could also use below
        //let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);

        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
              to: config.contract.address,
              from: userAddress,
              data: data
            });
        console.log(gasLimit.toString());
        console.log(gasPrice.toString()); 

        let networkId = 42;
        
        const daiPermitOptions = {
          spender: config.erc20ForwarderAddress,
          expiry: Math.floor(Date.now() / 1000 + 3600),
          allowed: true,
          networkId: networkId
        };

        await getDaiPermit(provider,userAddress,daiPermitOptions);
      
        let forwarder = await getBiconomyForwarderConfig(42);
        let forwarderContract = new ethers.Contract(
          forwarder.address,
          forwarder.abi,
          signer
        );

        const batchNonce = await forwarderContract.getNonce(userAddress,0);
        //const batchId = await biconomyForwarder.methods.getBatch(userAddress).call();
        console.log(batchNonce);

        const tokGasPrice = await getTokenGasPrice(networkId,config.tokenAddress);

        const gasLimitNum = Number(gasLimit.toNumber().toString());
        console.log(gasLimitNum);

        let request = await buildForwardTxRequest(networkId,{account:userAddress,to:config.contract.address,gasLimitNum,batchId:0,batchNonce,tokenGasPrice:tokGasPrice,data,tokenAddress:config.tokenAddress});
        const req = request.request;
        console.log(req);
        const cost = request.cost;
        console.log(cost);

        const hashToSign = getDataToSignForPersonalSign(req);

        signer.signMessage(hashToSign)
        .then(function(sig){
          console.log('signature ' + sig);
          sendTransaction({userAddress, req, sig, signatureType:"PERSONAL_SIGN"});
        })
        .catch(function(error) {
	        console.log(error)
	      });

      } else {
        showErrorMessage("Meta Transaction disabled");
      }
    } else {
      showErrorMessage("Error while sending");
    }
  };

  const sendTransaction = ({userAddress, req, sig, domainSeparator, signatureType}) => {
    if (ethersProvider && contract) {
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
            "apiId": "b2406d6a-c3dd-404c-90f7-f7978bc46eab",
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
           //event emitter methods
           ethersProvider.once(hash, (transaction) => {
            // Emitted when the transaction has been mined
            console.log(transaction);
            setTransactionHash(hash);
            getQuoteFromNetwork();
            })
        })
	      .catch(function(error) {
	        console.log(error)
	      });
      } catch (error) {
        console.log(error);
      }
    }
  };


  const getQuoteFromNetwork = async () => {
    if (ethersProvider && contract) {
      let result = await contract.getQuote();
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

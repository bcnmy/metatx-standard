import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ethers } from "ethers";
import Biconomy from "@biconomy/mexa";
import abi from "ethereumjs-abi";
import {toBuffer} from "ethereumjs-util";

import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { Box } from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const EIP712_SIGN = "EIP712_SIGN";
const PERSONAL_SIGN = "PERSONAL_SIGN";

var Web3 = require('web3');

const domainType = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" }
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" }
];

let domainData = {
  name: "TestContract",
  version: "1",
  verifyingContract: config.contract.address
};
let chainId = 42;

let networkProvider, walletProvider, walletSigner, networkSigner;
let randomSigner;
let web3, contractWeb3;
let contract, contractInterface, contractWithBasicSign, contractReadOnly;

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
          const provider = window["ethereum"];
          await provider.enable();
          // We're creating a 2nd Ethers provider linked to your L2 network of choice
          let biconomy = new Biconomy(new Web3.providers.HttpProvider("https://eth-kovan.alchemyapi.io/v2/DvW1I4OgMAVXJIw3zzfWHnQz1Lpeki9I"),{apiKey: "_iAMyHbdb.561e4a31-1cd5-43f3-a715-7f9478f39be8", debug: true});
          networkProvider = new ethers.providers.Web3Provider(biconomy);
          web3 = new Web3(biconomy);

          /*
            This provider linked to your wallet.
            If needed, substitute your wallet solution in place of window.ethereum 
          */
          walletProvider = new ethers.providers.Web3Provider(window.ethereum);
          walletSigner = walletProvider.getSigner();
          networkSigner = networkProvider.getSigner();
          setSelectedAddress(await walletSigner.getAddress());

          randomSigner = (ethers.Wallet.createRandom()).connect(networkProvider);

          //const biconomy = new Biconomy(provider,{apiKey: "bF4ixrvcS.7cc0c280-94cb-463f-b6bb-38d29cc9dfd2", debug: true});
          //ethersProvider = new ethers.providers.Web3Provider(biconomy);
          console.log(networkSigner);
          console.log(await walletSigner.getAddress());
          console.log(walletProvider);
          
          biconomy.onEvent(biconomy.READY, async () => {
            // Initialize your dapp here like getting user accounts etc
            /*contract = new ethers.Contract(
              config.contract.address,
              config.contract.abi,
              signer.connectUnchecked()
            );*/
            contractWeb3 = new web3.eth.Contract(
              config.contractWithBasicSign.abi,
              config.contractWithBasicSign.address 
            );

            contractWithBasicSign = new ethers.Contract(
              config.contractWithBasicSign.address,
              config.contractWithBasicSign.abi,
              randomSigner
            );

            console.log(contractWithBasicSign);

            contractReadOnly = new ethers.Contract(
              config.contractWithBasicSign.address,
              config.contractWithBasicSign.abi,
              new ethers.providers.JsonRpcProvider("https://eth-kovan.alchemyapi.io/v2/DvW1I4OgMAVXJIw3zzfWHnQz1Lpeki9I")
            )

            console.log(contractWithBasicSign);
            contractInterface = new ethers.utils.Interface(config.contractWithBasicSign.abi);
            getQuoteFromNetwork(PERSONAL_SIGN);
            console.log(quote);
          }).onEvent(biconomy.ERROR, (error, message) => {
            // Handle error while initializing mexa
            console.log(message);
            console.log(error);
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

  /*const onSubmitWithEIP712Sign = async event => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        let userAddress = selectedAddress;
        let nonce = await contract.getNonce(userAddress);
        let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);
        let message = {};
        message.nonce = parseInt(nonce);
        message.from = userAddress;
        message.functionSignature = functionSignature;

        const dataToSign = JSON.stringify({
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
          },
          domain: domainData,
          primaryType: "MetaTransaction",
          message: message
        });
        let signature = await ethersProvider.send("eth_signTypedData_v4", [userAddress, dataToSign])
        let { r, s, v } = getSignatureParameters(signature);
        sendSignedTransaction(userAddress, functionSignature, r, s, v, EIP712_SIGN);
      } else {
        console.log("Sending normal transaction");
        let tx = await contract.setQuote(newQuote);
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };*/

  const onSubmitWithPersonalSign = async event => {
    if (newQuote != "" && contractWithBasicSign && walletSigner) {
      setTransactionHash("");
      if (metaTxEnabled) {
        let userAddress = selectedAddress;
        let nonce = await contractWithBasicSign.getNonce(userAddress);
        //let nonce = await contractWeb3.methods.getNonce(userAddress).call();
        let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);
        let messageToSign = abi.soliditySHA3(
            ["uint256","address","uint256","bytes"],
            [parseInt(nonce), config.contractWithBasicSign.address, chainId, toBuffer(functionSignature)]
        );
        const signature = await walletSigner.signMessage(messageToSign);
        let { r, s, v } = getSignatureParameters(signature);
        sendSignedTransaction(userAddress, functionSignature, r, s, v, PERSONAL_SIGN);
      } else {
        console.log("Sending normal transaction");
        let tx = await contractWithBasicSign.setQuote(newQuote);
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork();
      }
    } else {
      showErrorMessage("Please enter the quote or check contract and signer object");
    }
  };

  const getSignatureParameters = signature => {
    if (!ethers.utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = ethers.BigNumber.from(v).toNumber();
    if (![27, 28].includes(v)) v += 27;
    return {
      r: r,
      s: s,
      v: v
    };
  };

  const getQuoteFromNetwork = async (signType) => {
      let result;
      if(signType == PERSONAL_SIGN) {
        result = await contractWithBasicSign.getQuote();
        //result = await contractWithBasicSign.getQuote();
        //result = await contractWeb3.methods.getQuote().call();
      } else {
        result = await contract.getQuote();
      }
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

  const sendSignedTransaction = async (userAddress, functionData, r, s, v, signType) => {
    if (contractWeb3) {
      try {
        let tx;
        if(signType == PERSONAL_SIGN) {
          let txData = await contractWithBasicSign.populateTransaction.executeMetaTransaction(userAddress, functionData, r, s, v);
          console.log(txData);
          tx = await networkProvider.send("eth_sendRawTransaction",[{"from":selectedAddress,"to":txData.to,"data":txData.data}]);
          //console.log("pre-call");
          //tx = await contractWeb3.methods
          //.executeMetaTransaction(userAddress, functionData, r, s, v)
          //.send({from: userAddress});
          //console.log("post call");
        } else {
          tx = await contract.executeMetaTransaction(userAddress, functionData, r, s, v);
        }
        console.log("Transaction hash : ", tx.hash);
        showInfoMessage(`Transaction sent by relayer with hash ${tx.hash}`);
        let confirmation = await tx.wait();
        console.log(confirmation);
        setTransactionHash(tx.hash);

        showSuccessMessage("Transaction confirmed on chain");
        getQuoteFromNetwork(signType);

      } catch (error) {
        console.log(error);
      }
    }
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
            <Link href={`https://kovan.etherscan.io/tx/${transactionHash}`} target="_blank"
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
            <Button variant="contained" color="primary" onClick={onSubmitWithPersonalSign} style={{marginLeft: "10px"}}>
              Submit (Persoanl Sign)
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;

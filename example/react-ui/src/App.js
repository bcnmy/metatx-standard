import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import {Biconomy} from "@biconomy/mexa"; // have to update a fix so there is no breaking changes
import { ethers } from "ethers";
import {makeStyles} from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {Box} from "@material-ui/core";
let sigUtil = require("eth-sig-util");
const { config } = require("./config");
const EIP712_SIGN = "EIP712_SIGN";
const PERSONAL_SIGN = "PERSONAL_SIGN";


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
    name: "chainId",
    type: "uint256",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
];

// for other networks omit chainId and verifyingContract and add them during init process based on provider->networkId
let domainData = {
  name: "TestContract",
  version: "1",
  chainId: 42,
  verifyingContract: config.contract.address,
};

let ethersProvider, signer;
let biconomy;
let contract, contractInterface, contractWithBasicSign;

const useStyles = makeStyles((theme) => ({
  root: {
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
  link: {
    marginLeft: "5px",
  },
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

        /*if (provider.networkVersion == chainId.toString()) {
          domainData.chainId = chainId;*/

        biconomy = new Biconomy(provider, {
          apiKey: "du75BkKO6.941bfec1-660f-4894-9743-5cdfe93c6209",
          debug: true,
        });

        ethersProvider = new ethers.providers.Web3Provider(biconomy);
        signer = ethersProvider.getSigner();
        console.log(signer);

        biconomy
          .onEvent(biconomy.READY, () => {
            // Initialize your dapp here like getting user accounts etc
            contract = new ethers.Contract(
              config.contract.address,
              config.contract.abi,
              signer.connectUnchecked()
            );
            contractInterface = new ethers.utils.Interface(config.contract.abi);
            setSelectedAddress(provider.selectedAddress);
            getQuoteFromNetwork();
            ethersProvider.on("accountsChanged", function (accounts) {
              setSelectedAddress(accounts[0]);
            });
          })
          .onEvent(biconomy.ERROR, (error, message) => {
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

  const onQuoteChange = (event) => {
    setNewQuote(event.target.value);
  };

  const onSubmit = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        //let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);
        //could also use populateTransaction 
        sendTransaction(userAddress, newQuote);
      } else {
        console.log("Sending normal transaction");
        contract.methods
          .setQuote(newQuote)
          .send({ from: selectedAddress })
          .on("transactionHash", function (hash) {
            showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          })
          .once("confirmation", function (confirmationNumber, receipt) {
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed");
            getQuoteFromNetwork();
          });
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const onSendSignedTx = async (event) => {
    if (newQuote != "" && contract) {
      setTransactionHash("");
      if (metaTxEnabled) {
        console.log("Sending meta transaction");
        let userAddress = selectedAddress;
        //let functionSignature = contractInterface.encodeFunctionData("setQuote", [newQuote]);
        //could also use populateTransaction 
        sendSignedRawTransaction(userAddress, newQuote);
      } else {
        console.log("Sending normal transaction");
        contract.methods
          .setQuote(newQuote)
          .send({ from: selectedAddress })
          .on("transactionHash", function (hash) {
            showInfoMessage(`Transaction sent to blockchain with hash ${hash}`);
          })
          .once("confirmation", function (confirmationNumber, receipt) {
            setTransactionHash(receipt.transactionHash);
            showSuccessMessage("Transaction confirmed");
            getQuoteFromNetwork();
          });
      }
    } else {
      showErrorMessage("Please enter the quote");
    }
  };

  const getQuoteFromNetwork = () => {
    if (ethersProvider && contract) {
      contract
        .getQuote()
        .then(function (result) {
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

  const showErrorMessage = (message) => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = (message) => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = (message) => {
    NotificationManager.info(message, "Info", 3000);
  };

  // contract should be registered as trusted forwarder
  // get user signature and send raw tx along with signature type
  const sendSignedRawTransaction = async (userAddress, arg) => {
    let privateKey =
      "cf7631b12222c3de341edc2031e01d0e65f664ddcec7aaa1685e303ca3570d44"; // or process.env.privKey
    let wallet = new ethers.Wallet(privateKey);  
    let functionSignature = contractInterface.encodeFunctionData("setQuote", [arg]);
    //could also use populateTransaction 

    // need to get gas estimation for ethers
    /*let gasLimit = await contract.methods
      .setQuote(arg)
      .estimateGas({ from: userAddress });*/


    let rawTx,signedTx;  

    rawTx = {
      to: config.contract.address,
      data: functionSignature,
      from: userAddress,
      signatureType: "EIP712_SIGN",
      
    }

    signedTx = await wallet.signTransaction(rawTx);

    console.log(signedTx);
    //console.log(signedTx.rawTransaction);


    // should get user message to sign EIP712/personal for trusted and ERC forwarder approach
    const dataToSign = await biconomy.getForwardRequestMessageToSign(
      signedTx
    );
    console.log(dataToSign);

    const signParams = dataToSign.eip712Format;

    //https://github.com/ethers-io/ethers.js/issues/687
    delete signParams.types.EIP712Domain;


    console.log(signParams);

    const signature = await wallet._signTypedData(signParams.domain, signParams.types, signParams.message);

    /*const signature = sigUtil.signTypedMessage(
      new Buffer.from(privateKey, "hex"),
      {
        data: dataToSign.eip712Format, // option to get personalFormat also 
      },
      "V4"
    );*/

    //let rawTransaction = signedTx.rawTransaction;

    let data = {
      signature: signature,
      rawTransaction: signedTx,
      signatureType: "EIP712_SIGN",
    };

  wallet = wallet.connect(ethersProvider);

  const createReceipt = await ethersProvider.sendTransaction(signedTx); // this is like send signed transaction
   await createReceipt.wait();
   console.log(`Transaction successful with hash: ${createReceipt.hash}`);

  /*  // console.log(ethersProvider.waitForTransaction);
    let transactionHash;  
    try {
      let receipt = await ethersProvider.sendTransaction(data); // should it be signedTx instead of data?
      console.log(receipt);
    } catch(error) {
      // Ethers check the hash from user's signed tx and hash returned from Biconomy
      // Both hash are expected to be different as biconomy send the transaction from its relayers
      if(error.returnedHash && error.expectedHash) {
        console.log("Transaction hash : ", error.returnedHash);
        transactionHash = error.returnedHash;
      } else {
        console.log(error);
        showErrorMessage("Error while sending transaction");
      }
    }

    if(transactionHash) {
      showInfoMessage(`Transaction sent by relayer with hash ${transactionHash}`);
      let receipt = await ethersProvider.waitForTransaction(transactionHash);
      console.log(receipt);
      showSuccessMessage("Transaction confirmed on chain");
      getQuoteFromNetwork();
    } else {
      showErrorMessage("Could not get transaction hash");
    }
*/

  };

  const sendTransaction = async (userAddress, arg) => {
    if (ethersProvider && contract) {
      try {
        let {data} = await contract.populateTransaction.setQuote(arg);
        let gasPrice = await ethersProvider.getGasPrice();
        let gasLimit = await ethersProvider.estimateGas({
          to: config.contract.address,
          from: userAddress,
          data: data
        })
        console.log(gasLimit.toString());
        console.log(gasPrice.toString()); 

        console.log(data);
        let txParams = {
           data: data,
           to: config.contract.address,
           from: userAddress,
           gasLimit: gasLimit,
           signatureType: "EIP712_SIGN"
        };  

        //let tx = await ethersProvider.sendTransaction(txParams); // yet to figure out       
        let tx = await ethersProvider.send("eth_sendTransaction", [txParams])

        console.log("Transaction hash : ", tx);
        showInfoMessage(`Transaction sent by relayer with hash ${tx}`);

        //event emitter methods
        ethersProvider.once(tx, (transaction) => {
          // Emitted when the transaction has been mined
          console.log(transaction);
          setTransactionHash(tx);
          getQuoteFromNetwork();
        })
        
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
          )}{" "}
        </div>
      </section>
      <section>
        {" "}
        {transactionHash !== "" && (
          <Box className={classes.root} mt={2} p={2}>
            <Typography>
              Check your transaction hash
              <Link
                href={`https://kovan.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                className={classes.link}
              >
                here
              </Link>
            </Typography>
          </Box>
        )}{" "}
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
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Submit
            </Button>
            <Button variant="contained" color="primary" onClick={onSendSignedTx}>
              SendSignedTx from backend
            </Button>
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  );
}

export default App;

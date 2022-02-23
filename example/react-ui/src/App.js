import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { ethers } from 'ethers';
import contract from './contracts/GaslessNFT.json';
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import Web3 from "web3";
import { Biconomy } from "@biconomy/mexa";
import {toBuffer} from "ethereumjs-util";


const { config } = require("./config")
const contractAddress = config.contract.address;
const abi = contract.abi;
const biconomy = new Biconomy()
let sigUtil = require('eth-sig-util');
let web3, walletWeb3
let chainId = 80001
let apiKey = config.apiKey

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [newTokenURI, setNewTokenURI] = useState("")
  const [loadingMessage, setLoadingMessage] = React.useState(" Loading Application ...");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  const [transactionHash, setTransactionHash] = useState("");
  const { ethereum } = window;

  let options = {
          apiKey: apiKey,
          debug: true
        };

  useEffect(() => {
    async function init() {
      if (
        typeof window.ethereum !== "undefined" && 
        window.ethereum.isMetaMask
      ) {
        // Ethereum User detected. You can proceed with the provider.
        const provider = window["ethereum"];
        await provider.enable();
        let ethersProvider = new ethers.providers.Web3Provider(provider);
        setLoadingMessage("Initializing Biconomy ...");
        
        const biconomy = new Biconomy(ethersProvider, options);

        // This web3 instance will be used to read normally and write contract via meta transactions.
        const web3 = new Web3(biconomy);

        // This web3 instance will be used to get user signature from connected wallet
        walletWeb3 = new Web3(window.ethereum);

        biconomy.onEvent(biconomy.READY, () => {
          // Initialise Dapp here
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(contractAddress, abi, signer);
          setCurrentAccount(provider.currentAccount);
          getMintCount();
          provider.on("accountsChanged", function (accounts){
            setCurrentAccount(accounts[0]);
          });
        }) .onEvent(biconomy.ERROR, (error, message) => {
          // Handle error while Initializing mexa 
        });
      } else {
        showErrorMessage("Metamask not installed")
      }
    }
    init(options);
  },[]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(newTokenURI !== ""){
      showSuccessMessage("URI link available, ready to mint.");
      console.log(newTokenURI);
    } else {
        showErrorMessage("Please insert URI link!")
    }
  };

  const checkWalletIsConnected = useCallback(async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  },[])

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const constructMetaTransactionMessage = (nonce, chainId, functionSignature, contractAddress) => {
    return abi.soliditySHA3(
        ["uint256","address","uint256","bytes"],
        [nonce, contractAddress, chainId, toBuffer(functionSignature)]
    );
  }

  const mintNftHandler = async () => {
    console.log(newTokenURI);
    if (newTokenURI !== "" && contract) {
      try {

        if (ethereum) {
          if(metaTxEnabled){
            console.log("Sending meta transaction...");

            let userAddress = currentAccount
            let nonce = await contract.methods.getNonce(userAddress).call();
            let functionSignature = contract.methods.mint(newTokenURI).encodeABI();
            let messageToSign = constructMetaTransactionMessage(nonce, chainId, functionSignature, contractAddress)

            // NOTE: We are using walletWeb3 here to get signature from connected wallet
            const signature = await walletWeb3.eth.personal.sign(
            "0x" + messageToSign.toString("hex"),
            userAddress
            );

            // Using walletWeb3 here, as it is connected tto the wallet where user account is present.
            let { r, s, v } = getSignatureParameters(signature);
            sendSignedTransaction(userAddress, functionSignature, r, s, v);

          } else {
            console.log("Sending normal transaction...");

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(contractAddress, abi, signer);

            console.log("Initialize payment");
            let nftTxn = await nftContract.mint(newTokenURI);

            console.log("Mining... please wait");
            await nftTxn.wait();

            console.log(`Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTxn.hash}`);
            showSuccessMessage("Congrats, your NFT has been minted!")
            refreshPage()
          }
          
        } else {
          console.log("Ethereum object does not exist");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      showErrorMessage("Please enter the URI link for your NFT media.")
    }
  }

  function refreshPage() {
    window.location.reload(false);
  }

  const showErrorMessage = message => {
    NotificationManager.error(message, "Error", 5000);
  };

  const showSuccessMessage = message => {
    NotificationManager.success(message, "Message", 3000);
  };

  const showInfoMessage = message => {
    NotificationManager.info(message, "Info", 3000);
  };

  const connectWalletButton = () => {
    return (
      <>
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
      </>
    )
  }

  const getSignatureParameters = signature => {
    if (!web3.utils.isHexStrict(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
  };

  // Update to retrieve the total number of NFTs minted
  const getMintCount = async() => {
    if (web3 && contract) {
      const tokenCount = await contract.tokenCounter;
      console.log(tokenCount);
      return tokenCount
    }
  };

  const sendSignedTransaction = async (userAddress, functionData, r, s, v) => {
    if (web3 && contract) {
      try {
          let gasLimit = await contract.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .estimateGas({ from: userAddress });
          let gasPrice = await web3.eth.getGasPrice();
          let tx = contract.methods
              .executeMetaTransaction(userAddress, functionData, r, s, v)
              .send({
                  from: userAddress
              });

          tx.on("transactionHash", function (hash) {
              console.log(`Transaction hash is ${hash}`);
              showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
          }).once("confirmation", function (confirmationNumber, receipt) {
              console.log(receipt);
              setTransactionHash(receipt.transactionHash);
              showSuccessMessage("Transaction confirmed on chain");
              getMintCount()
          });
      } catch (error) {
          console.log(error);
      };
    };
  };

  const mintNftButton = () => {
    console.log(newTokenURI);
    if (newTokenURI !== ""){
      return (
        <>
        <div>
          <div>
            <h1>Ready to mint NFT with URI: {newTokenURI}</h1>
          </div>
          <div>
            <button variant="contained" color="primary" onClick={mintNftHandler}>
              Mint NFT
            </button>
          </div>
        </div>
        </>
      )
    } else {
      return (
        <>
        <p>Paste the URI link for your NFT media data in the input above to continue.</p>
        </>
      )
    }
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [checkWalletIsConnected])

  return (
    <div className="App">
      <section className="main">
        <div className="header-container">
          <p className="header">🍃 <strong>Mint any NFT with media URI</strong> 🍃</p>
          <p className="sub-text">Upload your files to Arweave or any other web3 file storage system, type in the URI link to your media metadata below and mint your NFT.</p>
          {currentAccount ? `Connected with wallet ${currentAccount}` : `Please connect your wallet below to proceed`}
        </div>
      </section>
      <section>
        <div className="submit-container">
          <div className="submit-row">
            <input
              name="TokenURI"
              placeholder="Enter uri link for your NFT media"
              onChange={(e)=>{setNewTokenURI(e.target.value)}}
              value={newTokenURI}
            />
            <Button variant="contained" color="primary" onClick={(e)=>handleSubmit(e)}>
              🢀Link Goes Here
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className='submit-container'>
          <div>
            {currentAccount ? mintNftButton() : connectWalletButton()}
          </div>
        </div>
      </section>
      <NotificationContainer />
    </div>
  )
}

export default App;
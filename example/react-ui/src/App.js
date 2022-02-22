import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { ethers } from 'ethers';
import contract from './contracts/SampleNFT.json';
import Button from "@material-ui/core/Button";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import web3 from "web3";

const { config } = require("./config")
const contractAddress = config.contract.address;
const abi = contract.abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [newTokenURI, setNewTokenURI] = useState("")

  const submit = (e) => {
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

  const mintNftHandler = async () => {
    console.log(newTokenURI);
    if (newTokenURI !== "" && contract) {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(contractAddress, abi, signer);

          console.log("Initialize payment");
          let nftTxn = await nftContract.mint(newTokenURI);

          console.log("Mining... please wait");
          await nftTxn.wait();

          console.log(`Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTxn.hash}`);
          showSuccessMessage("Congrats, your NFT has been minted successfully!")
          refreshPage()
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

  const connectWalletButton = () => {
    return (
      <>
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
      </>
    )
  }

  // Update to retrieve the total number of NFTs minted
  const getMintCount = async() => {
    if (web3 && contract) {
      const tokenCount = await contract.tokenCounter;
      console.log(tokenCount);
      return tokenCount
    }
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
            <Button variant="contained" color="primary" onClick={(e)=>submit(e)}>
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
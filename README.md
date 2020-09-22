# Generalized Meta Transaction

Repository containing a gas cost effective standard for meta transaction to be used by any contract to enable native meta transaction feature on any function.
The approach support signed typed messages so that while signing the data on client side user see a human readable message instead of scary hex string.

You can see the LIVE DEMO <a href="https://metatx.biconomy.io" target="_blank" >Here</a>(works on Ropsten)

The standard is the result of initiative by metamask here https://medium.com/metamask/announcing-a-generalized-metatransaction-contest-abd4f321470b

Biconomy was selected as one of the finalist in the hackathon. Read <a href="https://medium.com/metamask/our-metatransaction-hackathon-winner-a620551ccb9b" target="_blank">here</a>

<h3>How do i use this in my Smart Contracts?</h3>

1. Inherit <a href="https://github.com/bcnmy/metatx-standard/blob/master/src/contracts/BasicMetaTransaction.sol" target="_blank" >BasicMetaTransaction</a> contract
2. Use msgSender() method where ever you were using msg.sender
That's it. Pretty simple

<h3>How do i use this in my client code?</h3>
In order to execute meta transactions you just need to call
executeMetaTransaction(address userAddress, bytes memory functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV)
inherited from BasicMetaTransaction.sol
<br/>

userAddress       => externally owned address of the user eg the user address in his metamask wallet<br/>

functionSignature => ABI encoding of function name with its parameter. Use web3 <a href="https://web3js.readthedocs.io/en/v1.2.4/web3-eth-contract.html#methods-mymethod-encodeabi" target="_blank" >encodeABI</a> method here

sigR              => 32 bytes r part of the signature

sigS              => 32 bytes s part of the signature

sigV              => integer v part of the signature


r,s,v can be calculated using web3 <a href="https://web3js.readthedocs.io/en/v2.0.0-alpha/web3-utils.html#getsignatureparameters" target="_blank" >getSignatureParameters</a> utility method.

Check out example front-end code <a href="https://github.com/bcnmy/metatx-standard/blob/basic-signature-metatx/example/react-ui/src/App.js" target="_blank" >here</a> and example solidity code <a href="https://github.com/bcnmy/metatx-standard/blob/basic-signature-metatx/src/contracts/TestContract.sol" target="_blank" >here</a>

<h3>How to Run test cases</h3>

<h5>Setup</h5>
Rename .secret.example to .secret and add 12 word mnemonic string in the first line

NOTE: Make sure you have nodejs version > 12.0.0<br/>
1. Hardcode the `chainId()` in BasicMetaTransaction.sol to the specific network Id e.g 42 for Kovan etc.
2. Similarly change the same networkId as above in `BasicMetaTransaction.test.js` at line 13.
3. Run `npm install` command to install all the dependencies
4. Run `ganache-cli` in separate cmd/terminal to run ganache client
5. At last, Run `npm run test` to run all the test cases.

<h3>How to get test coverage</h3>

1. Hardcode the `chainId()` in BasicMetaTransaction.sol to the specific network Id e.g 42 for Kovan etc.
2. Similarly change the same networkId as above in `BasicMetaTransaction.test.js` at line 13.
3. Run `npm install` command to install all the dependencies
4. Run `ganache-cli` in cmd/terminal to run ganache client
5. At last, Run `npm run coverage` to run all the test cases.


This repository is basic implementation of Native Meta Transactions.

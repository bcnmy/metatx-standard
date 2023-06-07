# Generalized Meta Transaction

Repository containing a gas cost effective standard for meta transaction to be used by any contract to enable native meta transaction feature on any function.
The approach support signed typed messages so that while signing the data on client side user see a human readable message instead of scary hex string.

You can see the LIVE DEMO <a href="https://dapp.biconomy.io/" target="_blank" >Here</a>(works on Kovan)

The standard is the result of initiative by metamask here https://medium.com/metamask/announcing-a-generalized-metatransaction-contest-abd4f321470b

Biconomy was selected as one of the finalist in the hackathon. Read <a href="https://medium.com/metamask/our-metatransaction-hackathon-winner-a620551ccb9b" target="_blank">here</a>

<h3>How do i use this in my Smart Contracts?</h3>

1. Inherit <a href="https://github.com/bcnmy/metatx-standard/blob/master/src/contracts/EIP712MetaTransaction.sol" target="_blank" >EIP712MetaTransaction</a> contract
2. Use msgSender() method where ever you were using msg.sender

<h3>How do i use this in my client code?</h3>
In order to execute meta transactions you just need to call
executeMetaTransaction(address userAddress, bytes memory functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV)
inherited from EIP712MetaTransaction.sol
<br/>

userAddress => externally owned address of the user eg the user address in his metamask wallet<br/>

sigR => 32 bytes r part of the signature

sigS => 32 bytes s part of the signature

sigV => integer v part of the signature

r,s,v can be calculated using ethers.js <a href="https://docs.ethers.org/v5/" target="_blank" > utility method</a>.

Since this standard supports <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank" >EIP-712</a> so signature parameters should be generated using eth_signTypedData_v3 or eth_signTypedData_v4 JSON RPC method.

<h3>How to Run test cases</h3>

NOTE: Make sure you have nodejs version > 12.0.0 <br/>

1. Run `npm install` command to install all the dependencies
2. At last, Run `npm run test` to run all the test cases.

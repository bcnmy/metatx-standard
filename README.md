# Generalized Meta Transaction

Repository containing a gas cost effective standard for meta transaction to be used by any contract to enable native meta transaction feature on any function.
The approach support EIP2771 approach to enable native meta-transaction in your contract..

<h3>How do i use this in my Smart Contracts?</h3>

1. Inherit <a href="https://github.com/opengsn/forwarder/blob/master/contracts/BaseRelayRecipient.sol" target="_blank" >BaseRelayRecipient</a> in your contract
2. Use msgSender() method where ever you were using msg.sender
3. Set trusted forwarder method while deploying the contract. Check <a href="https://docs.biconomy.io/misc/contract-addresses#binance-testnet" target="_blank" >here</a>

<h3>How do i use this in my client code?</h3>
Initialize Biconomy object in your contract. Pass Biconomy object in your web3/ethers constructor. Call your contract methods normally, no need to do any change it that. Check <a href="https://docs.biconomy.io/guides/enable-paying-gas-in-erc20/sdk#sdk-frontend-integration" target="_blank" >here</a> for reference code
<br/>

userAddress       => externally owned address of the user eg the user address in his metamask wallet<br/>

functionSignature => ABI encoding of function name with its parameter. Use web3 <a href="https://web3js.readthedocs.io/en/v1.2.4/web3-eth-contract.html#methods-mymethod-encodeabi" target="_blank" >encodeABI</a> method here

sigR              => 32 bytes r part of the signature

sigS              => 32 bytes s part of the signature

sigV              => integer v part of the signature


r,s,v can be calculated using web3 <a href="https://web3js.readthedocs.io/en/v2.0.0-alpha/web3-utils.html#getsignatureparameters" target="_blank" >getSignatureParameters</a> utility method.

<h5>Setup</h5>
Rename .secret.example to .secret and add 12 word mnemonic string in the first line<br/><br/>
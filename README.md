# Generalized Meta Transaction

# Pays for gas fees in ERC20 tokens

Repository containing a gas cost effective standard for meta transaction to be used by any contract to enable users in paying gas cost using supported ERC20 tokens on any function. The approach support signed typed messages (EIP712) so that while signing the data on client side user see a human readable message instead of scary hex string.

<h2>This example showcases using DAI tokens to pay for gas in dapp transactions using APIs.
https://docs.biconomy.io/guides/enable-paying-gas-in-erc20/using-api
The interaction from permitting tokens to target method call can be completely gasless! </h2>

<h3>How do i use this in my Smart Contracts?</h3>

1. Inherit <a href="https://github.com/opengsn/gsn/blob/master/contracts/BaseRelayRecipient.sol" target="_blank" >BaseRelayRecipient</a> contract 
2. Use _msgSender() method where ever you were using msg.sender
3. (Optional) Use msgRelayer() method to get the relayer address who paid for transaction gas fees
That's it. Pretty simple

<h3>How do i use this in my client code?</h3>
In order to execute meta transactions you just need to register your contracts as ERC20 Forwarder meta transactino approach, import the sdk and follow the documentation here https://docs.biconomy.io You can use the helper clients from here https://github.com/bcnmy/biconomy-helpers/blob/main/src/helpers/erc20ForwarderHelpers.js to build your API request
<br/>

Check out example front-end code <a href="https://github.com/bcnmy/metatx-standard/blob/erc20-metatx-api/example/react-ui/src/App.js" target="_blank" >here</a> and example solidity code <a href="https://github.com/bcnmy/metatx-standard/blob/erc20-forwarder-demo/src/contracts/TestForwarder.sol" target="_blank" >here</a>

This repository is basic implementation of Native Meta Transactions. This reposiory will be updated as per the <a href="https://github.com/ethereum/EIPs/issues/1776" target="_blank">EIP-1776</a> to implement native meta transactions with support of batching, transaction expiry etc

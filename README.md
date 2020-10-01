# Generalized Meta Transaction

Repository containing a gas cost effective standard for meta transaction to be used by any contract to enable native meta transaction feature on any function. 

The standard is the result of initiative by metamask here https://medium.com/metamask/announcing-a-generalized-metatransaction-contest-abd4f321470b

Biconomy was selected as one of the finalist in the hackathon. Read <a href="https://medium.com/metamask/our-metatransaction-hackathon-winner-a620551ccb9b" target="_blank">here</a>

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

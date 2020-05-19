pragma solidity ^0.5.13;
pragma experimental ABIEncoderV2;

import "./BasicMetaTransaction.sol";

contract TestContract is BasicMetaTransaction {

    string public quote;
    address public owner;

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
pragma solidity 0.6.0;

import "./BasicMetaTransaction.sol";

contract TestContract is BasicMetaTransaction {

    string public quote;
    address public owner;

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    function getQuote() public view returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
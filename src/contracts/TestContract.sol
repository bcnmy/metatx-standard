pragma solidity ^0.5.13;

contract TestContract {

    string public quote;
    address public owner;
    uint256 public value;

    function setQuote(string memory newQuote) public {
        value = 0;
        for(uint256 i=0; i<=200;i++){
            value += i;
        }
        quote = newQuote;
        owner = msg.sender;
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
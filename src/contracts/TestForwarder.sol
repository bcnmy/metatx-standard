pragma solidity ^0.6.2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract ForwarderTest is BaseRelayRecipient {

    string public quote;
    address public owner;
    
    // set biconomy's trusted forwarder for your network
    constructor(address forwarder) public{
        trustedForwarder = forwarder;
    }

    function setTrustedForwarder(address _forwarder) public {
        trustedForwarder = _forwarder;
    }

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = _msgSender();
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
    
    function versionRecipient() external virtual override view returns (string memory){return "1";}
}
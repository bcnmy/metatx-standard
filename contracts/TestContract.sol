pragma solidity ^0.6.2;

import "https://github.com/opengsn/forwarder/blob/master/contracts/BaseRelayRecipient.sol";

contract TestContract is BaseRelayRecipient {

    string public quote;
    address public owner;

     constructor(address _trustedForwarder) public {
        trustedForwarder = _trustedForwarder;
    }

    function setTrustedForwarder(address _trustedForwarder) public {
        trustedForwarder = _trustedForwarder;
    }

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = _msgSender();
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
    
    
    function versionRecipient() external view override returns (string memory) {
        return "1";
    }
}
pragma solidity 0.6.2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract TestContract is BaseRelayRecipient {

    string public quote;
    address public owner;

    constructor(address _trustedForwarder) public Ownable(owner) Pausable(owner) {
        trustedForwarder = _trustedForwarder;
    }

    function setTrustedForwarder( address forwarderAddress ) public {
        require(forwarderAddress != address(0), "Forwarder Address cannot be 0");
        trustedForwarder = forwarderAddress;
    }

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
    
    function versionRecipient() external virtual override view returns (string memory){return "1";}
}

pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract TestContract is BaseRelayRecipient {

    string public quote;
    address public owner;

    constructor(address _forwarder) public {
        setTrustedForwarder(_forwarder);
    }

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = _msgSender();
    }

    function setTrustedForwarder(address _forwarder) public {
        trustedForwarder = _forwarder;
    }

    function versionRecipient() external virtual override view returns (string memory){return "1";}


    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
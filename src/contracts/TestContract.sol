pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract TestContract is BaseRelayRecipient {

    string public quote;
    address public owner;
    string private paymasterVersion;

    constructor(address _forwarder, string memory _paymasterVersion) public {
        trustedForwarder = _forwarder;
        paymasterVersion = _paymasterVersion;
	}

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = _msgSender();
    }

    function getQuote() public view returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }

    function versionRecipient() external view override returns (string memory) {
        return "1";
    }
}
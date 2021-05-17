//SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

import "./EIP712MetaTransactionUpgradable.sol";

contract TestContractUpgradable is EIP712MetaTransactionUpgradable {

    string public quote;
    address public owner;

    constructor() public {
        EIP712MetaTransactionUpgradable.initialize("TestContractUpgradable","1");
    }

    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    function getQuote() view public returns(string memory currentQuote, address currentOwner) {
        currentQuote = quote;
        currentOwner = owner;
    }
}
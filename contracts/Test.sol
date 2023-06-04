// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Meta-transactions/EIP712MetaTransaction.sol";

contract Test is EIP712MetaTransaction {
    string public name;
    address private _owner;

    address private _owner2;

    constructor(
        string memory name_,
        string memory version_
    ) EIP712MetaTransaction(name_, version_) {
        name = name_;
    }

    function setOwner() external {
        _owner = msgSender();
    }

    function approve(address newOwner) external {
        _owner2 = newOwner;
    }

    function getOwner() external view returns (address) {
        return _owner;
    }
}

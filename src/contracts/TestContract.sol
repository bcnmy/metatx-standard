//SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./EIP712MetaTransaction.sol";

/// @title TestContract
/// @dev This contract can be used to set and retrive a Quote from the blockchain
/// @dev Inherits from EIP712MetaTransaction contract for EIP-712 type signature Meta Transaction functionality.
contract TestContract is EIP712MetaTransaction("TestContract","1") {

    string public quote;
    address public owner;

    /// @notice Sets the value of quote given by the user
    /// @param newQuote The quote given by the user
    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = msgSender();
    }

    /// @notice Retrives the quote given from the blockchain
    /// @return currentQuote, the currentQuote in the blockchain
    /// @return currentOwner, the Owner of the currentQuote
    function getQuote() view public returns(string memory, address) {
        string memory currentQuote = quote;
        address currentOwner = owner;

        return (currentQuote, currentOwner);
    }
}
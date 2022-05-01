//SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/// @title TestContract2771
/// @dev This contract can be used to set and retrive a Quote from the blockchain
/// @dev Inherits from ERC2771Context contract for Meta Transaction functionality.
contract TestContract2771 is ERC2771Context {

    string public quote;
    address public owner;

    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) {
        
    }

    /// @notice Sets the value of quote given by the user
    /// @param newQuote The quote given by the user
    function setQuote(string memory newQuote) public {
        quote = newQuote;
        owner = _msgSender();
    }

    /// @notice Retrives the quote given from the blockchain
    /// @return currentQuote, the currentQuote in the blockchain
    /// @return currentOwner, the Owner of the currentQuote
    function getQuote() view public returns(string memory, address) {
        string memory currentQuote = quote;
        address currentOwner = owner;

        return (currentQuote, currentOwner);
    }

    /// @notice Overrides _msgSender() function from Context.sol
    /// @return address The current execution context's sender address
    function _msgSender() internal view override(ERC2771Context) returns (address){
        return ERC2771Context._msgSender();
    }

    /// @notice Overrides _msgData() function from Context.sol
    /// @return address The current execution context's data
    function _msgData() internal view override(ERC2771Context) returns (bytes calldata){
        return ERC2771Context._msgData();
    }
}
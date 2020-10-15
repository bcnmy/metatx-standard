pragma solidity ^0.6.8;

interface IFeeMultiplier{
    function getFeeMultiplier(address user, address token) external returns (uint16 basisPoints); //setting max multiplier at 6.5536
}
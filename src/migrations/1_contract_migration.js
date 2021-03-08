const TestContract = artifacts.require("TestContract");

module.exports = function(deployer) {
  let trustedForwarder = "0xC857DD877935D37094152d404150B5890Dd740B1";
  deployer.deploy(TestContract, trustedForwarder);
};

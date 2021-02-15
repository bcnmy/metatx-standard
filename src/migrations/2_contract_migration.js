const TestContract = artifacts.require("TestContract");

module.exports = function(deployer) {
  deployer.deploy(TestContract, "<BICONOMY_TRUSTED_FORWARDER_ADDRESS>");
};

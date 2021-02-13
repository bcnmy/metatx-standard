const TestContract = artifacts.require("TestContract");

module.exports = function(deployer) {
  deployer.deploy(TestContract, "0x9CA27E862f33FC3c049828aD37618D48d690252f");
};

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MetaTransaction } = require("./web3.mtx");

describe("Meta Transaction", async function () {
  let treasury;
  let user1;
  let treasuryEtherBalance;
  let user1EtherBalance;
  let Test;

  before("Static Deployments", async function () {
    [treasury, user1] = await ethers.getSigners();

    // ------------------------------------------------------------------
    const TestFactory = await ethers.getContractFactory("Test");
    Test = await TestFactory.deploy("Test", "1");
    treasuryEtherBalance = await ethers.provider.getBalance(treasury.address);
    user1EtherBalance = await ethers.provider.getBalance(user1.address);
  });

  describe("Should have Gasless Transaction", async function () {
    it("Should Change ownership", async function () {
      await MetaTransaction(user1.address, Test.address, "setOwner", []);

      expect(await Test.getOwner()).to.equal(user1.address);

      const newTreasuryBalance = await ethers.provider.getBalance(
        treasury.address
      );

      expect(newTreasuryBalance).to.be.lessThan(treasuryEtherBalance);

      const newUser1Balance = await ethers.provider.getBalance(user1.address);

      expect(newUser1Balance).to.equal(user1EtherBalance);
    });
  });
});

const BasicMetaTransaction = artifacts.require("BasicMetaTransaction");
const TestContract = artifacts.require("TestContract");
const web3Abi = require('web3-eth-abi');
const {
    toBuffer
} = require("ethereumjs-util");
var abi = require('ethereumjs-abi');

contract("BasicMetaTransaction", function ([_, owner, account1]) {

    let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    let publicKey = "0x726cDa2Ac26CeE89F645e55b78167203cAE5410E";
    let privateKey = "0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2fa6";
    let testContract;
    let setQuoteAbi = {
        "inputs": [{
            "internalType": "string",
            "name": "newQuote",
            "type": "string"
        }],
        "name": "setQuote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    };
    let networkId = 42; // change it to the specific network Id like 42 (kovan) or 3 (ropsten)

    before('before', async function () {
        basicMetaTransaction = await BasicMetaTransaction.new({
            from: owner
        });
        testContract = await TestContract.new({
            from: owner
        });
    });

    describe("Call executeMetaTransaction", function () {
        it("Should be able to send transaction successfully", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            await testContract.executeMetaTransaction(publicKey, functionSignature, r, s, v);

            var newNonce = await testContract.getNonce(publicKey);
            assert.isTrue(newNonce.toNumber() == nonce + 1, "Nonce not incremented");
            let newQoute = await testContract.getQuote();
            assert.isTrue(newQoute.currentQuote == quoteToBeSet, "Unable to set quote");
        });

        it("Should call the contract method directly", async() => {
            let quoteToBeSet = "New quote";

            let oldNonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            await testContract.setQuote(quoteToBeSet, {from: owner});

            var newNonce = await testContract.getNonce(publicKey);
            assert.isTrue(newNonce.toNumber() == oldNonce.toNumber(), "Nonce got changed");
            let newQoute = await testContract.getQuote();
            assert.isTrue(newQoute.currentQuote == quoteToBeSet, "Unable to set quote");
            assert.isTrue(newQoute.currentOwner == owner, "Unable to set owner");
        })

        it("Should fail when replay transaction", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            await testContract.executeMetaTransaction(publicKey, functionSignature, r, s, v);

            try {
               await testContract.executeMetaTransaction(publicKey, functionSignature, r, s, v);
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type message , got '${error.message}'`);
            }
        });

        it("Should fail when user address is Zero", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            try {
               await testContract.executeMetaTransaction(ZERO_ADDRESS, functionSignature, r, s, v);
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type message , got '${error.message}'`);
            }
        });

        it("Should fail when Signature is in wrong format", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            try {
               await testContract.executeMetaTransaction(ZERO_ADDRESS, functionSignature, "0x0", s, v);
            } catch (error) {
                assert.isTrue(error.message.includes("Invalid signature"), `Wrong failure type message , got '${error.message}'`);
            }
        });

        it("Should fail", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            try {
                await testContract.executeMetaTransaction(account1, functionSignature, r, s, v);
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type message , got '${error.message}'`);
            }
        });
    });

    describe("Call verify method", function () {
        it("Should be able to verify the signature", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            let verifyStatus = await testContract.verify(publicKey, nonce.toNumber(), 42, functionSignature, r, s, v);
            assert.isTrue(verifyStatus == true, "Signer & Signature Do not match");
        });

        it("Should be failed - Signer and Signature do not match", async () => {
            let quoteToBeSet = "Divya";

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            const functionSignature = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [quoteToBeSet]
            );

            let messageToSign = await abi.soliditySHA3(
                ["uint256", "address", "uint256", "bytes"],
                [nonce.toNumber(), testContract.address, networkId, toBuffer(functionSignature)]
            );
            let signature = web3.eth.accounts.sign(messageToSign, privateKey);
            signature = signature.signature;
            let r = signature.slice(0, 66);
            let s = "0x".concat(signature.slice(66, 130));
            let v = "0x".concat(signature.slice(130, 132));
            v = web3.utils.hexToNumber(v);
            if (![27, 28].includes(v)) v += 27;

            let verifyStatus = await testContract.verify(account1, nonce.toNumber(), 42, functionSignature, r, s, v);
            assert.isTrue(verifyStatus == false, "Signer & Signature matched");
        });
    });
});
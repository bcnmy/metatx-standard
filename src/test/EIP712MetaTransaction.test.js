const EIP712MetaTransaction = artifacts.require("EIP712MetaTransaction");
const TestContract = artifacts.require("TestContract");
const web3Abi = require('web3-eth-abi');
const sigUtil = require('eth-sig-util');

let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
let publicKey = "0x726cDa2Ac26CeE89F645e55b78167203cAE5410E";
let privateKey = "0x68619b8adb206de04f676007b2437f99ff6129b672495a6951499c6c56bc2fa6";
let executeMetaTransactionABI = {
    "constant": false,
    "inputs": [{
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
    }, {
        "internalType": "bytes",
        "name": "functionSignature",
        "type": "bytes"
    }, {
        "internalType": "bytes32",
        "name": "sigR",
        "type": "bytes32"
    }, {
        "internalType": "bytes32",
        "name": "sigS",
        "type": "bytes32"
    }, {
        "internalType": "uint8",
        "name": "sigV",
        "type": "uint8"
    }],
    "name": "executeMetaTransaction",
    "outputs": [{
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
    }],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
};
let setQuoteAbi = {
    "constant": false,
    "inputs": [{
        "internalType": "string",
        "name": "newQuote",
        "type": "string"
    }],
    "name": "setQuote",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
};
let quoteToBeSet = "Divya";

const domainType = [{
        name: "name",
        type: "string"
    },
    {
        name: "version",
        type: "string"
    },
    {
        name: "chainId",
        type: "uint256"
    },
    {
        name: "verifyingContract",
        type: "address"
    }
];

const metaTransactionType = [{
        name: "nonce",
        type: "uint256"
    },
    {
        name: "from",
        type: "address"
    },
    {
        name: "functionSignature",
        type: "bytes"
    }
];

let domainData;

const getTransactionData = async (nonce, abi, params) => {

    const functionSignature = web3Abi.encodeFunctionCall(
        abi,
        params
    );

    let message = {};
    message.nonce = parseInt(nonce);
    message.from = publicKey;
    message.functionSignature = functionSignature;

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    };
    const signature = sigUtil.signTypedData_v4(new Buffer(privateKey.substring(2, 66), 'hex'), {
        data: dataToSign
    });

    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    v = web3.utils.hexToNumber(v);
    if (![27, 28].includes(v)) v += 27;

    return {
        r,
        s,
        v,
        functionSignature
    };
}

contract("EIP712MetaTransaction", function ([_, owner, account1]) {

    let eip712MetaTransaction;
    let testContract

    before('before', async function () {
        eip712MetaTransaction = await EIP712MetaTransaction.new("TestContract", "1", {
            from: owner
        });
        testContract = await TestContract.new({
            from: owner
        });
        domainData = {
            name: "TestContract",
            version: "1",
            verifyingContract: testContract.address,
            chainId: 99999
        };
    });

    describe("Check Methods", function () {
        it("Should be able to send transaction successfully", async () => {
            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            let {
                r,
                s,
                v,
                functionSignature
            } = await getTransactionData(nonce, setQuoteAbi, [quoteToBeSet]);

            let sendTransactionData = web3Abi.encodeFunctionCall(
                executeMetaTransactionABI,
                [publicKey, functionSignature, r, s, v]
            );
            await testContract.sendTransaction({
                value: 0,
                from: owner,
                gas: 500000,
                data: sendTransactionData
            });

            var newNonce = await testContract.getNonce(publicKey);
            assert.isTrue(newNonce.toNumber() == nonce + 1, "Nonce not incremented");
            let newQoute = await testContract.getQuote();
            assert.isTrue(newQoute.currentQuote == quoteToBeSet, "Unable to set quote");
        });

        it("Call the contract method directly", async() => {

            let newQuoteToSet = "New Quote";
            var oldNonce = await testContract.getNonce(publicKey);
            let sendTransactionData = web3Abi.encodeFunctionCall(
                setQuoteAbi,
                [newQuoteToSet]
            );

            await testContract.sendTransaction({
                value: 0,
                from: owner,
                gas: 500000,
                data: sendTransactionData
            });

            var newNonce = await testContract.getNonce(publicKey);
            assert.isTrue(newNonce.toNumber() == oldNonce.toNumber(), "Nonce are not same");
            let updatedQuote = await testContract.getQuote();
            assert.isTrue(updatedQuote.currentQuote == newQuoteToSet, "Unable to set quote");
            assert.isTrue(updatedQuote.currentOwner == owner, "Owner does not match");
        })

        it("Should fail when try to call executeMetaTransaction method itself", async () => {
            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            let setQuoteData = await getTransactionData(nonce, setQuoteAbi, [quoteToBeSet]);
            let {r, s, v, functionSignature} = await getTransactionData(nonce,
                executeMetaTransactionABI,
                [publicKey, setQuoteData.functionSignature, setQuoteData.r, setQuoteData.s, setQuoteData.v])
            const sendTransactionData = web3Abi.encodeFunctionCall(
                executeMetaTransactionABI,
                [publicKey, functionSignature, r, s, v]
            );

            try {
                await testContract.sendTransaction({
                    value: 0,
                    from: owner,
                    gas: 500000,
                    data: sendTransactionData
                });
            } catch (error) {
                assert.isTrue(error.message.includes("functionSignature can not be of executeMetaTransaction method"), `Wrong failure type`);
            }
        });

        it("Should fail when replay transaction", async () => {
            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            let {
                r,
                s,
                v,
                functionSignature
            } = await getTransactionData(nonce, setQuoteAbi, [quoteToBeSet]);

            const sendTransactionData = web3Abi.encodeFunctionCall(
                executeMetaTransactionABI,
                [publicKey, functionSignature, r, s, v]
            );

            await testContract.sendTransaction({
                value: 0,
                from: owner,
                gas: 500000,
                data: sendTransactionData
            });

            try {
                await testContract.sendTransaction({
                    value: 0,
                    from: owner,
                    gas: 500000,
                    data: sendTransactionData
                });
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type`);
            }
        });

        it("Should fail when user address is Zero", async () => {

            let nonce = await testContract.getNonce(publicKey, {
                from: owner
            });
            let {
                r,
                s,
                v,
                functionSignature
            } = await getTransactionData(nonce, setQuoteAbi, [quoteToBeSet]);

            const sendTransactionData = web3Abi.encodeFunctionCall(
                executeMetaTransactionABI,
                [ZERO_ADDRESS, functionSignature, r, s, v]
            );

            try {
                await testContract.sendTransaction({
                    value: 0,
                    from: owner,
                    gas: 500000,
                    data: sendTransactionData
                });
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type`);
            }
        });

        it("Should be failed - Signer and Signature do not match", async () => {
            let nonce = await eip712MetaTransaction.getNonce(publicKey, {
                from: owner
            });
            let {
                r,
                s,
                v,
                functionSignature
            } = await getTransactionData(nonce, setQuoteAbi, [quoteToBeSet]);

            const sendTransactionData = web3Abi.encodeFunctionCall(
                executeMetaTransactionABI,
                [account1, functionSignature, r, s, v]
            );

            try {
                await testContract.sendTransaction({
                    value: 0,
                    from: owner,
                    gas: 500000,
                    data: sendTransactionData
                });
            } catch (error) {
                assert.isTrue(error.message.includes("Signer and signature do not match"), `Wrong failure type`);
            }
        });
    });
});

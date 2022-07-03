const Hasher = require("./Hasher.json");

const poseidon = require("circomlibjs").poseidon;
const mimcsponge = require("circomlibjs").mimcsponge;
const Tree = require("fixed-merkle-tree");
//const fs = require("fs-extra");
//const path = require("path");
//const { BigNumber, BigNumberish, ethers } = require("ethers");

const mint1Args = require('./calldata/mint1.json');
const mint2Args = require('./calldata/mint2.json');
const shield1Args = require('./calldata/shield1.json');
const shield2Args = require('./calldata/shield2.json');
const transferArgs = require('./calldata/transfer.json');
const unshieldArgs = require('./calldata/unshield.json');
const sellArgs = require('./calldata/sell.json');
const transfer2Args = require('./calldata/transfer2.json');
const unshield2Args = require('./calldata/unshield2.json');
//require('./public/zkProofs/transfer/transfer.wasm')

const dotenv = require("dotenv");
dotenv.config();

const { ethers, waffle } = require("hardhat");
/* global BigInt */
const { BigNumber, BigNumberish } = require("ethers");

const { prove } = require('./utils');

//const {transferCalldata} = require('./callDataFunctions.js')

const { groth16 } = require("snarkjs");
//const bigInt = require('big-integer');





async function main() {
    //console.log(process.env.REACT_APP_GO_RPC_URL);
    const MERKLE_TREE_HEIGHT = 10;

    const provider = waffle.provider;
    const [signer, signer2, signer3, signer4] = await ethers.getSigners();

    const HasherFactory = new ethers.ContractFactory(Hasher.abi, Hasher.bytecode, signer);
    const hasher = await HasherFactory.deploy();

    //const MintVerifierFactory = await ethers.getContractFactory("MintVerifier");
    //const mintVerifier = await MintVerifierFactory.deploy();

    const Verifier = await ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    await verifier.deployed();

    const ZkCards = await ethers.getContractFactory("ZkCards");
    //const zkCards = await ZkCards.deploy(verifier.address, mintVerifier.address, 2, hasher.address);
    const zkCards = await ZkCards.deploy(verifier.address, MERKLE_TREE_HEIGHT, hasher.address);
    await zkCards.deployed();

    async function buildMerkleTree() {
        const filter = zkCards.filters.NewCommitment()
        const events = await zkCards.queryFilter(filter, 0)

        const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))
        //console.log("Leaves")
        //console.log(leaves)
        return new Tree(MERKLE_TREE_HEIGHT, leaves)
    }

    console.log("Contract:", zkCards.address);
    //console.log(buildMerkleTree())
    console.log();

    async function printOwnerOf(id) {
        const owner = await zkCards.ownerOf(id);
        console.log(`Owner of ${id} is ${owner}`);
    }

    const card1 = {
        "attribute1": 2,
        "attribute2": 4,
        "attribute3": 1,
        "hashKey": 85
    };

    let callD = await mintCalldata(card1.attribute1, card1.attribute2, card1.attribute3, card1.hashKey);
    //console.log(mint1Args)
    console.log("Mint token 1");
    //await zkCards.mint(...mint1Args);
    //await printOwnerOf(mint1Args[3][0])
    await zkCards.mint(...callD);
    console.log();
    /*
      //// Prepare inputs to create the shield1 proof
      const card1 = {
        "attribute1": 2,
        "attribute2": 4,
        "attribute3": 1,
        "hashKey": 85
      };
      const hashedId1 = mimcsponge.multiHash([card1.attribute1, card1.attribute2, card1.attribute3, poseidon([card1.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()
      const shield1 = {
        id: hashedId1,
        secret: 11
      };
      let pubKey1 = poseidon([shield1.secret]).toString();
      let commitment1 = poseidon([shield1.id, pubKey1]).toString();
      console.log(commitment1);
      let newTree = buildMerkleTree();
      newTree.insert(commitment1);
    */

    const hashedId = mimcsponge.multiHash([card1.attribute1, card1.attribute2, card1.attribute3, poseidon([card1.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

    // The shielding transaction info that is needed to calculate the commitment
    const shield = {
        id: hashedId,
        secret: 11
    };

    callD = await shieldCalldata(shield.id, shield.secret);

    console.log("Shield token 1");
    //await zkCards.shield(...shield1Args);
    //await printOwnerOf(shield1Args[3][1])
    await zkCards.shield(...callD);
    console.log();


    const card2 = { "attribute1": 2, "attribute2": 4, "attribute3": 3, "hashKey": 88 };

    callD = await mintCalldata(card2.attribute1, card2.attribute2, card2.attribute3, card2.hashKey);

    console.log("Mint token 2");
    //await zkCards.mint(...mint2Args);
    //await printOwnerOf(mint2Args[3][0])
    await zkCards.mint(...callD);
    console.log();

    const hashedId2 = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, poseidon([card2.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

    // The shielding transaction info that is needed to calculate the commitment
    const shield2 = {
        id: hashedId2,
        secret: 22
    };

    callD = await shieldCalldata(shield2.id, shield2.secret);

    console.log("Shield token 2");
    //await zkCards.shield(...shield2Args);
    //await printOwnerOf(shield2Args[3][1])
    await zkCards.shield(...callD);
    console.log();

    /////////////////////////////////////////////////////Transfer card1

    /// Prepare input for the transfer proof

    // Build the Merkle tree of commitments so far
    let tree = await buildMerkleTree();

    // Note the data for the card we would like to locate its commitment

    const hashedId1 = mimcsponge.multiHash([card1.attribute1, card1.attribute2, card1.attribute3, poseidon([card1.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()

    // The shielding transaction info that is needed to calculate the commitment
    const shield1 = {
        id: hashedId1,
        secret: 11
    };
    let pubKey1 = poseidon([shield1.secret]).toString();
    let commitment1 = poseidon([shield1.id, pubKey1]).toString();
    //console.log(commitment1);

    // Find the index of the commitment1 in the Merkle tree
    let index = tree.indexOf(toFixedHex(commitment1))
    //console.log("Index of commitment 1")
    //console.log(index)
    let newSecret = 21;
    let pubKeyReceiver = poseidon([newSecret]).toString();

    const input_transfer1 =
    {
        id: shield1.id,
        root: tree.root(),
        secret: shield1.secret,
        pubKeyReceiver: pubKeyReceiver,
        pathElements: tree.path(index).pathElements.map(x => x.toString()),
        pathIndices: tree.path(index).pathIndices.map(x => x.toString())
    };
    //console.log(input_transfer1)

    callD = await transferCalldata(input_transfer1.id, input_transfer1.root, input_transfer1.secret, input_transfer1.pubKeyReceiver, input_transfer1.pathElements, input_transfer1.pathIndices)
    //console.log(calData)
    console.log("Transfer");
    //console.log(transferArgs[3][0])
    //await zkCards.transfer(...transferArgs);
    await zkCards.transfer(...callD);
    console.log();

    //////////////////////////////////////// Unshield card 1 //////////////////////////////
    tree = await buildMerkleTree();


    let commitment = poseidon([shield1.id, pubKeyReceiver]).toString();
    //console.log(commitment);

    // Find the index of the commitment in the Merkle tree
    index = tree.indexOf(toFixedHex(commitment))
    //console.log("Index of commitment")
    //console.log(index)

    // Signer number 2
    let address = signer2.address.toString();


    const input_unshield =
    {
        id: shield1.id,
        address: address,
        root: tree.root(),
        secretKey: newSecret,
        pathElements: tree.path(index).pathElements.map(x => x.toString()),
        pathIndices: tree.path(index).pathIndices.map(x => x.toString())
    };
    //console.log(input_unshield)

    callD = await unshieldCalldata(input_unshield.id, input_unshield.address, input_unshield.root, input_unshield.secretKey, input_unshield.pathElements, input_unshield.pathIndices);


    console.log("Unshield token 1");
    //console.log(unshieldArgs[3][0])
    //await zkCards.connect(signer2).unshield(...unshieldArgs);
    //await printOwnerOf(unshieldArgs[3][1]);
    await zkCards.connect(signer2).unshield(...callD)
    console.log("signer2");
    console.log(signer2.address);
    console.log();

    let balanceInWei1 = await provider.getBalance(signer.address);
    let balanceInWei2 = await provider.getBalance(signer2.address);
    let balanceInWei3 = await provider.getBalance(zkCards.address);
    console.log("Balance of signer1 before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei1));
    console.log("Balance of signer2 before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei2));
    console.log("Balance of contract before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei3));
    console.log();
    console.log("Make a bid with attributes matched by token 2");
    let bidArgs = ["0x22cb87f3dca5dfa6a499d0c83df3e7d2e477d0b882404d529fed0ca995f32a1d", "0x0000000000000000000000000000000000000000000000000000000000000002", "0x0000000000000000000000000000000000000000000000000000000000000004", "0x0000000000000000000000000000000000000000000000000000000000000003"]
    //console.log(zkCards.get)
    await zkCards.connect(signer2).makeBid(...bidArgs, { value: ethers.utils.parseUnits("10", "ether") });
    balanceInWei1 = await provider.getBalance(signer.address);
    balanceInWei2 = await provider.getBalance(signer2.address);
    balanceInWei3 = await provider.getBalance(zkCards.address);
    console.log();
    console.log("Balance of signer1 after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei1));
    console.log("Balance of signer2 after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei2));
    console.log("Balance of contract after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei3));
    console.log();

    ////////////////////////////////////////////////// Selling card 2
    tree = await buildMerkleTree();
    pubKey = poseidon([shield2.secret]).toString();
    commitment = poseidon([shield2.id, pubKey]).toString();
    //console.log(commitment);

    // Find the index of the commitment in the Merkle tree
    index = tree.indexOf(toFixedHex(commitment))
    //console.log("Index of commitment")
    //console.log(index)
    let secret2 = 93984;
    let pubKeyReceiver2 = poseidon([secret2]).toString();

    const input_sell =
    {
        address: signer4.address.toString(),
        id: shield2.id,
        root: tree.root(),
        secret: shield2.secret,
        pubKeyReceiver: pubKeyReceiver2,
        pathElements: tree.path(index).pathElements.map(x => x.toString()),
        pathIndices: tree.path(index).pathIndices.map(x => x.toString())
    };
    console.log("Address seller")
    console.log(input_sell.address)

    callD = await sellCalldata(input_sell.address, input_sell.id, input_sell.root, input_sell.secret, input_sell.pubKeyReceiver, input_sell.pathElements, input_sell.pathIndices, card2.attribute1, card2.attribute2, card2.attribute3, card2.hashKey)


    console.log("Sell token 2");
    //console.log(sellArgs[3][0]);
    //await zkCards.sell(...sellArgs);
    console.log(input_sell.address)
    let response = await zkCards.connect(signer4).sell(...callD);
    console.log(response.address)
    //await printOwnerOf(sellArgs[3][3]);
    //sellArgs[3][3] is the pubKey of the buyer i.e. new owner

    //////////////////////////////////////////////// transfer Card2 so as we can re-shield it 
    // Locate the commitment corresponding to the card that we bought in the previous step
    // The attributes are public at this point and the the pubkeyReceiver is our own
    const newId = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, input_sell.pubKeyReceiver].map((x) => BigNumber.from(x).toBigInt())).toString();

    // New note refering to "card1" but with a new owner this time

    let sellCommitment = poseidon([
        newId,
        input_sell.pubKeyReceiver
    ]).toString();

    // Build the Merkle tree of commitments so far
    tree = await buildMerkleTree();

    // Find the index of the commitment in the Merkle tree
    index = tree.indexOf(toFixedHex(sellCommitment))

    // New public address that we will transfer to when re-shielding
    let secret3 = 3393984;
    let pubKeyReceiver3 = poseidon([secret3]).toString();
    console.log("Pubkey receiver 3")
    console.log(pubKeyReceiver3)

    const input_transfer2 =
    {
        id: newId,
        root: tree.root(),
        secret: secret2,
        pubKeyReceiver: pubKeyReceiver3,
        pathElements: tree.path(index).pathElements.map(x => x.toString()),
        pathIndices: tree.path(index).pathIndices.map(x => x.toString())
    };
    //console.log(input_transfer2)

    callD = await transferCalldata(input_transfer2.id, input_transfer2.root, input_transfer2.secret, input_transfer2.pubKeyReceiver, input_transfer2.pathElements, input_transfer2.pathIndices)

    console.log("Transfer2");
    //console.log(transfer2Args[3][0]);
    //await zkCards.transfer(...transfer2Args);
    await zkCards.transfer(...callD);
    console.log();

    //////////////////////////////////////////////////// Unshield Card2 

    // Build the Merkle tree of commitments so far
    tree = await buildMerkleTree();

    commitment = poseidon([
        input_transfer2.id,
        //transfer.newSecret
        input_transfer2.pubKeyReceiver
    ]).toString();
    // Find the index of the commitment in the Merkle tree
    index = tree.indexOf(toFixedHex(commitment))

    const input_unshield2 = {
        id: input_transfer2.id,
        // address is second hardhat address in decimal
        address: address,
        root: tree.root(),
        secret: secret3,
        pathElements: tree.path(index).pathElements.map(x => x.toString()),
        pathIndices: tree.path(index).pathIndices.map(x => x.toString())
    };
    //console.log(input_unshield2)
    callD = await unshieldCalldata(input_unshield2.id, input_unshield2.address, input_unshield2.root, input_unshield2.secret, input_unshield2.pathElements, input_unshield2.pathIndices);


    console.log("Unshield token 2");
    //console.log(unshield2Args[3][0]);
    await zkCards.connect(signer2).unshield(...callD);
    await printOwnerOf(unshield2Args[3][1]);
    console.log("signer2");
    console.log(signer2.address);
    console.log();

    console.log(await (await buildMerkleTree()).root())



    // New public address that we will transfer to when re-shielding
    let secret4 = 553393984;
    let pubKeyReceiver4 = poseidon([secret4]).toString();

    balanceInWei1 = await provider.getBalance(signer.address);
    balanceInWei2 = await provider.getBalance(signer2.address);
    balanceInWei3 = await provider.getBalance(zkCards.address);
    let balanceInWei4 = await provider.getBalance(signer3.address);
    console.log("Balance of signer1 before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei1));
    console.log("Balance of signer2 before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei2));
    console.log("Balance of contract before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei3));
    console.log("Balance of signer3 before sell is ");
    console.log(ethers.utils.formatEther(balanceInWei4));
    console.log();
    console.log("Make a bid with attributes matched by token 1");
    bidArgs = [pubKeyReceiver4, "0x0000000000000000000000000000000000000000000000000000000000000002", "0x0000000000000000000000000000000000000000000000000000000000000004", "0x0000000000000000000000000000000000000000000000000000000000000001"]
    //console.log(zkCards.get)
    await zkCards.connect(signer3).makeBid(...bidArgs, { value: ethers.utils.parseUnits("10", "ether") });
    balanceInWei1 = await provider.getBalance(signer.address);
    balanceInWei2 = await provider.getBalance(signer2.address);
    balanceInWei3 = await provider.getBalance(zkCards.address);
    balanceInWei4 = await provider.getBalance(signer3.address);
    console.log();
    console.log("Balance of signer1 after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei1));
    console.log("Balance of signer2 after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei2));
    console.log("Balance of contract after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei3));
    console.log("Balance of signer3 after sell is ");
    console.log(ethers.utils.formatEther(balanceInWei4));
    console.log();

    await zkCards.connect(signer3).cancel(...bidArgs);
    balanceInWei4 = await provider.getBalance(signer3.address);
    console.log(ethers.utils.formatEther(balanceInWei4));

    
        const filter_new = zkCards.filters.NewBid();
        const filter_accepted = zkCards.filters.BidAccepted();
        const filter_cancelled = zkCards.filters.BidCancelled();

        const events_new = await zkCards.queryFilter(filter_new, 0)
        const events_accepted = await zkCards.queryFilter(filter_accepted, 0)
        const events_cancelled = await zkCards.queryFilter(filter_cancelled, 0)
        
        //const filtered = events_new.filter((a) => a.args.value && )

        //    const leaves = events.sort((a, b) => a.args.index - b.args.index).map((e) => toFixedHex(e.args.commitment))

        console.log(events_accepted)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


/*
const unstringifyBigInts = (o) => {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o)
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts)
    } else if (typeof o == "object") {
        const res = {}
        for (let k in o) {
            res[k] = unstringifyBigInts(o[k])
        }
        return res
    } else {
        return o
    }
}
*/

/* global BigInt */
async function exportCallDataGroth16(input, wasmPath, zkeyPath) {

    const { proof, publicSignals } = await groth16.fullProve(
        input,
        wasmPath,
        zkeyPath
    );
    //console.log("right after fullProve")
    //console.log(proof);
    //console.log(publicSignals);

    const editedPublicSignals = publicSignals;//unstringifyBigInts(publicSignals);
    const editedProof = proof;//unstringifyBigInts(proof);

    //console.log(editedProof);

    const calldata = await groth16.exportSolidityCallData(
        editedProof,
        editedPublicSignals
    );
    //console.log(calldata);
    //console.log(calldata[0]);

    const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = [];

    for (let i = 8; i < argv.length; i++) {
        Input.push(argv[i]);
    }

    //console.log([a, b, c, Input]);
    return [a, b, c, Input];
}
//const bigInt = require('big-integer');
//const path = require("path");


//const circuitsDir = path.resolve(__dirname, "circuits");pubKeyReceiver
async function mintCalldata(attribute1, attribute2, attribute3, hashKey) {

    const input =
    {
        attribute1: attribute1,
        attribute2: attribute2,
        attribute3: attribute3,
        hashKey: hashKey
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/mint/mint.wasm",
            "./public/zkProofs/mint/mint.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}
async function shieldCalldata(shieldId, secretKey) {

    const input =
    {
        id: shieldId,
        secret: secretKey
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/shield/shield.wasm",
            "./public/zkProofs/shield/shield.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}
async function transferCalldata(shieldId, root, secretKey, pubKey, path_elements, path_indices) {


    const input =
    {
        id: shieldId,
        root: root,
        secret: secretKey,
        pubKeyReceiver: pubKey,
        pathElements: path_elements,
        pathIndices: path_indices
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/transfer/transfer.wasm",
            "./public/zkProofs/transfer/transfer.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}
async function sellCalldata(address, shieldId, root, secretKey, pubKey, path_elements, path_indices, attribute1, attribute2, attribute3, hashKey) {

    const input =
    {
        address: address,
        id: shieldId,
        root: root,
        secret: secretKey,
        pubKeyReceiver: pubKey,
        pathElements: path_elements,
        pathIndices: path_indices,
        attribute1: attribute1,
        attribute2: attribute2,
        attribute3: attribute3,
        hashKey: hashKey
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/sell/sell.wasm",
            "./public/zkProofs/sell/sell.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}
async function unshieldCalldata(shieldId, address, root, secretKey, path_elements, path_indices) {

    const input =
    {
        id: shieldId,
        address: address,
        root: root,
        secret: secretKey,
        pathElements: path_elements,
        pathIndices: path_indices
    };

    //const input = { attribute1: 2, attribute2: 4, attribute3: 1, hashKey: 55};
    let dataResult;

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "./public/zkProofs/unshield/unshield.wasm",
            "./public/zkProofs/unshield/unshield.zkey"
        );
    } catch (error) {
        console.log(error);
        //window.alert("Wrong answer");
    }

    return dataResult;
}



/** BigNumber to hex string of specified length */
function toFixedHex(number, length = 32) {
    let result =
        '0x' +
        (number instanceof Buffer
            ? number.toString('hex')
            : BigNumber.from(number).toHexString().replace('0x', '')
        ).padStart(length * 2, '0')
    if (result.indexOf('-') > -1) {
        result = '-' + result.replace('-', '')
    }
    return result
}

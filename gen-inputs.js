//const { MerkleTree, PartialMerkleTree } = require('fixed-merkle-tree');
//const { poseidon, mimcsponge } = require("circomlib");
//const { poseidon} = require("circomlib");
const poseidon = require("circomlibjs").poseidon;
const mimcsponge = require("circomlibjs").mimcsponge;
const Tree = require("fixed-merkle-tree");
const fs = require("fs-extra");
const path = require("path");
const { BigNumber, BigNumberish, ethers } = require("ethers");

const circuitsDir = path.resolve(__dirname, "circuits");

async function main() {
  const tree = new Tree(2);
  //console.log(poseidon([1,2,0,0,0]));
  //console.log(tree)

  // First zkCard to mint
  const card1 = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 1,
    "hashKey": 88
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "mint1.input.json"), card1);
  // Its unique identifying id that is created during the minting process
  const hashedId1 = mimcsponge.multiHash([card1.attribute1, card1.attribute2, card1.attribute3, card1.hashKey].map((x) => BigNumber.from(x).toBigInt())).toString()
  //console.log(hashedId)
  //const hashedIdHex = BigNumber.from(hashedId1).toHexString();
  //console.log(hashedIdHex);

  // First shielded transaction involving "card1"
  const shield1 = {
    id: hashedId1,
    secret: 11
  };
  //console.log(poseidon)

  // Note/Commitment that the owner of the shielded card can use at a later point in order to claim it.
  let pubKey1 = poseidon([shield1.secret]).toString();
  let commitment = poseidon([shield1.id, pubKey1]).toString();
  console.log(commitment);
  tree.insert(commitment);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield1.input.json"), shield1);

  // Second card to mint
  const card2 = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 3,
    "hashKey": 88
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "mint2.input.json"), card2);

  // Unique id for "card2"
  const hashedId2 = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, card2.hashKey].map((x) => BigNumber.from(x).toBigInt())).toString()
  //const hashHex2 = BigNumber.from(hashedId2).toHexString();
  // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
  //const bytes32_2 = ethers.utils.hexZeroPad(hashHex2, 32);
  //console.log(bytes32_2);
  //console.log(hashedId2);

  // Second shielded tranaction involving "card2"
  const shield2 = {
    id: hashedId2,
    secret: 22
  };
  // Note for "card2"
  let pubKey2 = poseidon([shield2.secret]).toString();
  commitment = poseidon([shield2.id, pubKey2]).toString();
  tree.insert(commitment);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield2.input.json"), shield2);
  console.log(commitment);
  // transfer.input.json

  // Shielded transfer of shielded "card1"
  let newSecret = 21;
  let pubKeyReceiver = poseidon([newSecret]).toString();
  console.log("pubkey");
  console.log(pubKeyReceiver)
  const transfer = {
    id: hashedId1,
    root: tree.root(),
    secret: shield1.secret,
    //newSecret: 21,
    pubKeyReceiver: pubKeyReceiver,
    pathElements: tree.path(0).pathElements.map(x => x.toString()),
    pathIndices: tree.path(0).pathIndices.map(x => x.toString()),
    //nullifier: mimcsponge.multiHash([shield1.id, shield1.secret]).toString()
  };
  //console.log(transfer.id);

  // New note refering to "card1" but with a new owner this time
  let newCommitment = poseidon([
    transfer.id,
    //transfer.newSecret
    pubKeyReceiver
  ]).toString();
  tree.insert(newCommitment)
  fs.writeJsonSync(path.resolve(circuitsDir, "transfer.input.json"), transfer);

  //console.log(tree);

  // Unshield the note
  const unshield = {
    id: transfer.id,
    // address is second hardhat address in decimal
    address: "642829559307850963015472508762062935916233390536",
    root: tree.root(),
    secret: newSecret,
    pathElements: tree.path(2).pathElements.map(x => x.toString()),
    pathIndices: tree.path(2).pathIndices.map(x => x.toString()),
    //nullifier: mimcsponge.multiHash([transfer.id, transfer.newSecret]).toString()
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "unshield.input.json"), unshield);
}



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
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
  const tree = new Tree(3);
  //console.log(poseidon([1,2,0,0,0]));
  //console.log(tree)

  // First zkCard to mint
  const card1 = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 1,
    "hashKey": 85
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "mint1.input.json"), card1);

  // Its unique identifying id that is created during the minting process
  
  const hashedId1 = mimcsponge.multiHash([card1.attribute1, card1.attribute2, card1.attribute3, poseidon([card1.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()
  
  //console.log(hashedId)
  //const hashedIdHex = BigNumber.from(hashedId1).toHexString();
  //console.log(hashedIdHex);

  // First shielded transaction involving "card1"
  const shield1 = {
    id: hashedId1,
    secret: 11
  };

  // Note/Commitment that the owner of the shielded card can use at a later point in order to claim it.
  let pubKey1 = poseidon([shield1.secret]).toString();
  let commitment1 = poseidon([shield1.id, pubKey1]).toString();
  console.log(commitment1);
  tree.insert(commitment1);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield1.input.json"), shield1);

  // Second zkCard to mint
  const card2 = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 3,
    "hashKey": 88
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "mint2.input.json"), card2);

  // Unique id for "card2"
  const hashedId2 = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, poseidon([card2.hashKey]).toString()].map((x) => BigNumber.from(x).toBigInt())).toString()
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
  let commitment2 = poseidon([shield2.id, pubKey2]).toString();
  tree.insert(commitment2);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield2.input.json"), shield2);
  console.log(commitment2);

  // Shielded transfer of shielded "card1"
  // Generate private/public keypair for the receiver

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
  tree.insert(newCommitment);
  console.log(newCommitment);
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



  let secret2 = 93984;
  let pubKeyReceiver2 = poseidon([secret2]).toString();
  // Sell "card2"
  const sell = {
    id: shield2.id,
    root: tree.root(),
    secret: shield2.secret,
    pubKeyReceiver: pubKeyReceiver2,
    pathElements: tree.path(1).pathElements.map(x => x.toString()),
    pathIndices: tree.path(1).pathIndices.map(x => x.toString()),
    attribute1: 2,
    attribute2: 4,
    attribute3: 3,
    hashKey: 88
  };

  const newId = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, sell.pubKeyReceiver].map((x) => BigNumber.from(x).toBigInt())).toString();

  // New note refering to "card1" but with a new owner this time

  let sellCommitment = poseidon([
    newId,
    sell.pubKeyReceiver
  ]).toString();
  tree.insert(sellCommitment)
  console.log(sellCommitment);
  fs.writeJsonSync(path.resolve(circuitsDir, "sell.input.json"), sell);

  // Shielded transfer of shielded "card1"
  // Generate private/public keypair for the receiver

  let secret3 = 3393984;
  let pubKeyReceiver3 = poseidon([secret3]).toString();
  console.log("pubkey");
  console.log(pubKeyReceiver)
  const transfer2 = {
    id: newId,
    root: tree.root(),
    secret: secret2,
    pubKeyReceiver: pubKeyReceiver3,
    pathElements: tree.path(3).pathElements.map(x => x.toString()),
    pathIndices: tree.path(3).pathIndices.map(x => x.toString()),
  };
  console.log(mimcsponge.multiHash([transfer2.id,transfer2.secret]).toString());

  // New note refering to "card2" but with a new owner/pubKey this time
  newCommitment = poseidon([
    transfer2.id,
    //transfer.newSecret
    pubKeyReceiver3
  ]).toString();
  tree.insert(newCommitment)
  fs.writeJsonSync(path.resolve(circuitsDir, "transfer2.input.json"), transfer2);

console.log('commitement before last unshield')
console.log(newCommitment)
// Unshield the note
const unshield2 = {
  id: transfer2.id,
  // address is second hardhat address in decimal
  address: "642829559307850963015472508762062935916233390536",
  root: tree.root(),
  secret: secret3,
  pathElements: tree.path(4).pathElements.map(x => x.toString()),
  pathIndices: tree.path(4).pathIndices.map(x => x.toString()),
};
  console.log(mimcsponge.multiHash([unshield2.id, unshield2.secret]).toString());
fs.writeJsonSync(path.resolve(circuitsDir, "unshield2.input.json"), unshield2);
fs.writeJsonSync(path.resolve(circuitsDir, "unshield2.json"), unshield2);

console.log("pubkey");
console.log(pubKeyReceiver)
}



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
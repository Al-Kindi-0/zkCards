const { MerkleTree, PartialMerkleTree } = require('fixed-merkle-tree');
//const { poseidon} = require("circomlib");
const poseidon = require("circomlibjs").poseidon;
const mimcsponge = require("circomlibjs").mimcsponge;
const Tree = require("fixed-merkle-tree");
//const { poseidon, mimcsponge } = require("circomlib");
const fs = require("fs-extra");
const path = require("path");
const { BigNumber, BigNumberish , ethers} = require("ethers");

const circuitsDir = path.resolve(__dirname, "circuits");

async function main() {
  const tree = new Tree(2);
console.log(poseidon([1,2,0,0,0]));
  //console.log(tree)
  const card = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 1,
    "hashKey": 88
  };
  const hashedId = mimcsponge.multiHash([card.attribute1, card.attribute2, card.attribute3, card.hashKey].map((x) => BigNumber.from(x).toBigInt())).toString()
  console.log(hashedId)
  const shield1 = {
    id: hashedId,
    secret: 11
  };
  console.log(poseidon)
  shield1.commitment = poseidon([shield1.id, shield1.secret]).toString();
  console.log(shield1.commitment);
  tree.insert(shield1.commitment);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield1.input.json"), shield1);
const card2 = {
    "attribute1": 2,
    "attribute2": 4,
    "attribute3": 3,
    "hashKey": 88
  };
  const hashedId2 = mimcsponge.multiHash([card2.attribute1, card2.attribute2, card2.attribute3, card2.hashKey].map((x) => BigNumber.from(x).toBigInt())).toString()
  const hashHex2 = BigNumber.from(hashedId2).toHexString();
  // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
  const bytes32_2 = ethers.utils.hexZeroPad(hashHex2, 32);
  //console.log(bytes32_2);
  console.log(hashedId2);

  const shield2 = {
    id: hashedId2,
    secret: 22
  };
  shield2.commitment = poseidon([shield2.id, shield2.secret]).toString();
  tree.insert(shield2.commitment);
  fs.writeJsonSync(path.resolve(circuitsDir, "shield2.input.json"), shield2);
  console.log(shield2.commitment);
  // transfer.input.json
  const transfer = {
    id: hashedId,
    root: tree.root(),
    secret: shield1.secret,
    newSecret: 21,
    pathElements: tree.path(0).pathElements.map(x => x.toString()),
    pathIndices: tree.path(0).pathIndices.map(x => x.toString()),
    nullifier: mimcsponge.multiHash([shield1.id, shield1.secret]).toString()
  };
  //console.log(transfer.id);
  transfer.newCommitment = poseidon([
    transfer.id,
    transfer.newSecret
  ]).toString();
  tree.insert(transfer.newCommitment)
  fs.writeJsonSync(path.resolve(circuitsDir, "transfer.input.json"), transfer);

  //console.log(tree);
  // unshield.input.json
  const unshield = {
    id: transfer.id,
    // address is second hardhat address in decimal
    address: "642829559307850963015472508762062935916233390536",
    root: tree.root(),
    secret: transfer.newSecret,
    pathElements: tree.path(2).pathElements.map(x => x.toString()),
    pathIndices: tree.path(2).pathIndices.map(x => x.toString()),
    nullifier: mimcsponge.multiHash([transfer.id, transfer.newSecret]).toString()
  };
  fs.writeJsonSync(path.resolve(circuitsDir, "unshield.input.json"), unshield);
}



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
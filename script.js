const Hasher = require("./Hasher.json");

const mint1Args = require('./calldata/mint1.json');
const mint2Args = require('./calldata/mint2.json');
const shield1Args = require('./calldata/shield1.json');
const shield2Args = require('./calldata/shield2.json');
const transferArgs = require('./calldata/transfer.json');
const unshieldArgs = require('./calldata/unshield.json');
const sellArgs = require('./calldata/sell.json');

const { ethers } = require("hardhat");

async function main() {
  const [signer, signer2] = await ethers.getSigners();

  const HasherFactory = new ethers.ContractFactory(Hasher.abi, Hasher.bytecode, signer);
  const hasher = await HasherFactory.deploy();

  //const MintVerifierFactory = await ethers.getContractFactory("MintVerifier");
  //const mintVerifier = await MintVerifierFactory.deploy();

  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();

  const ZkCards = await ethers.getContractFactory("ZkCards");
  //const zkCards = await ZkCards.deploy(verifier.address, mintVerifier.address, 2, hasher.address);
  const zkCards = await ZkCards.deploy(verifier.address,  2, hasher.address);
  await zkCards.deployed();

  console.log("Contract:", zkCards.address);
  console.log();

  async function printOwnerOf(id) {
    const owner = await zkCards.ownerOf(id);
    console.log(`Owner of ${id} is ${owner}`);
  }
console.log(mint1Args)
  console.log("Mint token 1");
  await zkCards.mint(...mint1Args);
  await printOwnerOf(mint1Args[3][0])
  console.log();

  console.log("Shield token 1");
  await zkCards.shield(...shield1Args);
  await printOwnerOf(shield1Args[3][1])
  console.log();

  console.log("Mint token 2");
  await zkCards.mint(...mint2Args);
  await printOwnerOf(mint2Args[3][0])
  console.log();

  console.log("Shield token 2");
  await zkCards.shield(...shield2Args);
  await printOwnerOf(shield2Args[3][1])
  console.log();

  console.log("Transfer");
  await zkCards.transfer(...transferArgs);
  console.log();

  console.log("Unshield token 1");
  await zkCards.connect(signer2).unshield(...unshieldArgs);
  await printOwnerOf(unshieldArgs[3][1]);
  console.log("signer2");
  console.log(signer2.address);
  console.log();

  console.log("Sell token 2");
  await zkCards.sell(...sellArgs);
  await printOwnerOf(sellArgs[3][3]);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

const Hasher = require("./Hasher.json");

const mint1Args = require('./calldata/mint1.json');
const mint2Args = require('./calldata/mint2.json');
const shield1Args = require('./calldata/shield1.json');
const shield2Args = require('./calldata/shield2.json');
const transferArgs = require('./calldata/transfer.json');
const unshieldArgs = require('./calldata/unshield.json');
const sellArgs = require('./calldata/sell.json');
const transfer2Args = require('./calldata/transfer2.json');
const unshield2Args = require('./calldata/unshield2.json');

const dotenv = require("dotenv");
dotenv.config();

const { ethers, waffle } = require("hardhat");

async function main() {
  console.log(process.env.REACT_APP_GO_RPC_URL);
  const provider = waffle.provider;
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
  const zkCards = await ZkCards.deploy(verifier.address,  3, hasher.address);
  await zkCards.deployed();

  console.log("Contract:", zkCards.address);
  console.log();

  async function printOwnerOf(id) {
    const owner = await zkCards.ownerOf(id);
    console.log(`Owner of ${id} is ${owner}`);
  }
//console.log(mint1Args)
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
  //console.log(transferArgs[3][0])
  await zkCards.transfer(...transferArgs);
  console.log();

  console.log("Unshield token 1");
  //console.log(unshieldArgs[3][0])
  await zkCards.connect(signer2).unshield(...unshieldArgs);
  await printOwnerOf(unshieldArgs[3][1]);
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
  let bidArgs = ["0x22cb87f3dca5dfa6a499d0c83df3e7d2e477d0b882404d529fed0ca995f32a1d","0x0000000000000000000000000000000000000000000000000000000000000002","0x0000000000000000000000000000000000000000000000000000000000000004","0x0000000000000000000000000000000000000000000000000000000000000003"]
  //console.log(zkCards.get)
  await zkCards.connect(signer2).makeBid(...bidArgs,{ value: ethers.utils.parseUnits("10","ether") });
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


  console.log("Sell token 2");
  //console.log(sellArgs[3][0]);
  await zkCards.sell(...sellArgs);
  //await printOwnerOf(sellArgs[3][3]);
  //sellArgs[3][3] is the pubKey of the buyer i.e. new owner

  console.log("Transfer2");
  //console.log(transfer2Args[3][0]);
  await zkCards.transfer(...transfer2Args);
  console.log();

  console.log("Unshield token 2");
  //console.log(unshield2Args[3][0]);
  await zkCards.connect(signer2).unshield(...unshield2Args);
  await printOwnerOf(unshield2Args[3][1]);
  console.log("signer2");
  console.log(signer2.address);
  console.log();

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

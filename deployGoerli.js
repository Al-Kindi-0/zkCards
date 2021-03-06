const hre = require("hardhat");
const Hasher = require("./Hasher.json");

async function main() {
    //const network = providers.networks.goerli;

    //const provider = providers.getDefaultProvider(network);
    let provider = new ethers.providers.InfuraProvider("goerli", "472154f64c7144f7853594f0b401a43e");
    var signer = new ethers.Wallet(process.env.REACT_APP_PRIVAT_KEY, provider);

    const HasherFactory = new hre.ethers.ContractFactory(Hasher.abi, Hasher.bytecode, signer);
    const hasher = await HasherFactory.deploy();

    const Verifier = await hre.ethers.getContractFactory("Verifier");
    const verifier = await Verifier.deploy();
    await verifier.deployed();

    const ZkCards = await hre.ethers.getContractFactory("ZkCards");
    const zkCards = await ZkCards.deploy(verifier.address, 3, hasher.address);
    await zkCards.deployed();



    console.log("Hasher deployed to:", hasher.address);
    console.log("Verifier deployed to:", verifier.address);
    console.log("Main contract deployed to:", zkCards.address);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});




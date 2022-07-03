require("@nomiclabs/hardhat-waffle");
require("hardhat-circom");
const dotenv = require("dotenv");
dotenv.config();
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const HARMONY_PRIVATE_KEY = "ffe647ed6767070498f8b22e145a9b93af5d678bf28522e286ec1b6e2cc84eb7";
module.exports = {
  solidity: {
    compilers: [{ version: "0.7.6" }, { version: "0.8.15" }, { version: "0.6.7" }]
  },
  circom: {
    ptau: "pot15_final.ptau",
    circuits:
      //[{ name: "mint" }, { name: "unshield" }, { name: "transfer" }, { name: "shield" }, { name: "sell" }]
    [{ name: "unshield" }]
  },

  networks: {
    goerli: {
      url: process.env.REACT_APP_GO_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVAT_KEY]
    },
    hardhat: {
      //chainId: 31377
    },
    testnet: { url: `https://api.s0.ps.hmny.io/`, accounts: [`0x${HARMONY_PRIVATE_KEY}`] },
    matic_test: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.MATIC_TEST_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETH_SCAN_URL,
  }
  
};

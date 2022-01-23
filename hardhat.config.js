require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require('hardhat-contract-sizer');
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

const path = require("path");
require('dotenv').config({path: path.join(process.cwd(), ".env.private")});

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
module.exports = {
  solidity: "0.8.2",
  defaultNetwork: 'hardhat',
  contractSizer: {
    runOnCompile: true
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
    }
  },
  networks: {
    hardhat: {},
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY_ROPSTEN]

    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY_RINKEBY]
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [process.env.PRIVATE_KEY_LOCALHOST]
    }
  },
  mocha: {
    timeout: 400000 // Long timeout needed for tests which mint a lot of tokens.
  }
};

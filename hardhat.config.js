require("@nomiclabs/hardhat-waffle");
const path = require("path");
require('dotenv').config({path: path.resolve(process.cwd(), '.env.private')});

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
module.exports = {
  solidity: "0.8.4",
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    ropsten: {
      // gas: 8000000,
      url: 'https://ropsten.infura.io/v3/988691afec5549ffab46a963c1a90f88',
      accounts: [process.env.PRIVATE_KEY_ROPSTEN]

    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/a5744db4c3304fea8b4059d3018b1a89",
      accounts: [process.env.PRIVATE_KEY_RINKEBY]
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [process.env.PRIVATE_KEY_LOCALHOST]
    },
  },
  mocha: {
    timeout: 400000
  }
};

const hre = require("hardhat");

async function main() {

    const Galaget = await hre.ethers.getContractFactory("Galaget");
    const contract = Galaget.attach(process.env.CONTRACT_ADDRESS);
    const tokenUri = await contract.tokenURI(0);
    console.log("Token URI: " + tokenUri);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
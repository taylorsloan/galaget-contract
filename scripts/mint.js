const hre = require("hardhat");

async function main() {

    const Galaget = await hre.ethers.getContractFactory("Galaget");
    const contract = Galaget.attach(process.env.CONTRACT);
    const mintedNft = await contract.mintToken();
    console.log("Token Minted");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
const hre = require("hardhat");

async function main() {

    const Galaget = await hre.ethers.getContractFactory("Galaget");
    const contract = Galaget.attach(process.env.CONTRACT_ADDRESS);
    const owner = await contract.ownerOf(1);
    console.log(owner);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
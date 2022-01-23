const chai = require("chai");
const expect = chai.expect;
chai.use(require('chai-string'));
chai.use(require('chai-as-promised'));
const {ethers} = require("hardhat");
const NAME = "Galaget";
const SYMBOL = "GLGT";
const BASE_URI = "ipfs://FAKE-CID/";
const METADATA_URI = "https://galaget.com/galaget-contract-metadata.json";

const runLongTests = false;

describe("Galaget", function () {
    it("Should support contract level metadata", async function () {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        expect(await galaget.contractURI()).to.be.equal(METADATA_URI);
    });
    it("Should mint a new token", async function () {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        await galaget.mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        expect(await galaget.ownerOf(0)).exist;
    });
    it("Should allow owner to mint a free token", async function () {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        await galaget.mintToken();
        expect(await galaget.ownerOf(0)).exist;
    });
    it("Should not allow non-owners to mint a free token", async function () {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [_, addr1] = await ethers.getSigners();
        await expect(galaget.connect(addr1).mintToken()).to.eventually.be.rejected;
    });
    it("Should allow non-minters to mint tokens", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [_, addr1] = await ethers.getSigners();
        await galaget.connect(addr1).mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        expect(await galaget.ownerOf(0)).to.equal(addr1.address);
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.02"));
    });
    if (runLongTests) {
        it("Should make tier 2 tokens cost 0.04 ETH", async () => {
            const Galaget = await ethers.getContractFactory("Galaget");
            const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
            await galaget.deployed();
            const [_, addr1, addr2] = await ethers.getSigners();
            for (let i = 0; i < 1111; i++) {
                await galaget.connect(addr1).mintToken({
                    value: ethers.utils.parseEther("0.02")
                });
            }
            // This price should change from 0.02 to 0.04.
            await expect(galaget.connect(addr1).mintToken({
                value: ethers.utils.parseEther("0.02")
            })).to.eventually.be.rejected;
            await galaget.connect(addr2).mintToken({
                value: ethers.utils.parseEther("0.04")
            });
            expect(await galaget.ownerOf(1111)).to.equal(addr2.address);
        });
        it("Should make tier 3 tokens cost 0.06 ETH", async () => {
            const Galaget = await ethers.getContractFactory("Galaget");
            const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
            await galaget.deployed();
            const [_, addr1, addr2] = await ethers.getSigners();
            for (let i = 0; i < 2222; i++) {
                await galaget.connect(addr1).mintToken({
                    value: ethers.utils.parseEther("0.04")
                });
            }
            // This price should change from 0.04 to 0.06.
            await expect(galaget.connect(addr1).mintToken({
                value: ethers.utils.parseEther("0.04")
            })).to.eventually.be.rejected;
            await galaget.connect(addr2).mintToken({
                value: ethers.utils.parseEther("0.06")
            });
            expect(await galaget.ownerOf(2222)).to.equal(addr2.address);
        });
        it("Should make tier 4 tokens cost 0.08 ETH", async () => {
            const Galaget = await ethers.getContractFactory("Galaget");
            const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
            await galaget.deployed();
            const [_, addr1, addr2] = await ethers.getSigners();
            for (let i = 0; i < 3333; i++) {
                await galaget.connect(addr1).mintToken({
                    value: ethers.utils.parseEther("0.06")
                });
            }
            // This price should change from 0.06 to 0.08.
            await expect(galaget.connect(addr1).mintToken({
                value: ethers.utils.parseEther("0.06")
            })).to.eventually.be.rejected;
            await galaget.connect(addr2).mintToken({
                value: ethers.utils.parseEther("0.08")
            });
            expect(await galaget.ownerOf(3333)).to.equal(addr2.address);
        });
        it("Should not allow more than 4445 tokens", async () => {
            const Galaget = await ethers.getContractFactory("Galaget");
            const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
            await galaget.deployed();
            const [_, addr1, addr2] = await ethers.getSigners();
            for (let i = 0; i < 4445; i++) {
                await galaget.connect(addr1).mintToken({
                    value: ethers.utils.parseEther("0.08")
                });
            }
            await expect(galaget.connect(addr2).mintToken({
                value: ethers.utils.parseEther("0.08")
            })).to.eventually.be.rejectedWith(Error);
        });
    }
    it("Should implement the Ownable interace", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [owner] = await ethers.getSigners();
        expect(await galaget.owner()).to.equal(owner.address);
    });
    it("Should only allow contract owner to withdraw funds", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [owner, addr1] = await ethers.getSigners();
        // Contract balance should be 0.0 ETH.
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.0"));
        await galaget.connect(addr1).mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        // Contract balance should be 0.02 ETH after minting one token.
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.02"));
        // Contract should reject non-owners from withdrawing funds.
        await expect(galaget.connect(addr1).withdraw(owner.address)).to.be.rejected;
        // Contract balance should still be 0.02 ETH.
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.02"));
        const previousOwnerBalance = await owner.getBalance();
        // console.log(formatEther(previousOwnerBalance));
        // Contract should allow contract owner to withdraw all funds.
        await expect(galaget.withdraw(owner.address)).to.eventually.be.fulfilled;
        // Contract balance should be 0.0 ETH after withdrawal.
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.0"));
        const withdrawnOwnerBalance = await owner.getBalance();
        // console.log(formatEther(withdrawnOwnerBalance));
        // console.log(formatEther(withdrawnOwnerBalance.sub(previousOwnerBalance)));
        // Contract owner's balance should have increased (gas fees will take a bit of the amount).
        expect(withdrawnOwnerBalance.gte(previousOwnerBalance.add(ethers.utils.parseEther("0.019")))).to.be.true;
    });
    it("Should return current token ID", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        expect(await galaget.totalSupply()).to.equal(0);
        await galaget.mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        expect(await galaget.totalSupply()).to.equal(1);
    });
    it("Should support EIP-2981 royalties interface", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const result = await galaget.supportsInterface("0x2a55205a");
        expect(result).to.equal(true);
    });
    it("Minted tokens should have EIP-2981 royalties of 4 percent", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [owner] = await ethers.getSigners();
        // Test with sale price of 1 ETH
        const royaltyInfo = await galaget.royaltyInfo(0, ethers.utils.parseEther("1"));
        expect(royaltyInfo.receiver).to.equal(owner.address);
        expect(royaltyInfo.royaltyAmount).to.equal(ethers.utils.parseEther("0.04"));
    });
    it("Should be pausible and unpausible only by owner", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [_, addr1] = await ethers.getSigners();
        await galaget.pause()
        await expect(galaget.mintToken()).to.eventually.be.rejected;
        await galaget.unpause();
        await expect(galaget.mintToken()).to.eventually.be.fulfilled;
        await expect(galaget.connect(addr1).pause()).to.eventually.be.rejected;
        await expect(galaget.mintToken()).to.eventually.be.fulfilled;
        await expect(galaget.connect(addr1).unpause()).to.eventually.be.rejected;
    });
    it("Should allow only owner to change token base URI", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [_, addr1] = await ethers.getSigners();
        const changedUri = "ipfs://changed";
        await galaget.setBaseURI(changedUri);
        await galaget.mintToken();
        const tokenUri = await galaget.tokenURI(0);
        expect(tokenUri).to.startWith(changedUri);
        const changedUri2 = "ipfs://changed2";
        await expect(galaget.connect(addr1).setBaseURI(changedUri2)).to.eventually.be.rejected;
        expect(tokenUri).to.not.startWith(changedUri2);
    });
    it("Should output a contract Uri", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const contractURI = await galaget.contractURI();
        expect(contractURI).to.not.be.empty;
    });
});

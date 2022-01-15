const chai = require("chai");
const expect = chai.expect;
chai.use(require('chai-as-promised'))
const {ethers} = require("hardhat");
const {BigNumber} = require("ethers");
const NAME = "Galaget";
const SYMBOL = "GLGT";
const BASE_URI = "ipfs://FAKE-CID/";
const TEST_WALLET = "0x243dc2F47EC5A0693C5c7bD39b31561cCd4B0e97";
// "Galaget", "GLGT", "ipfs://bafybeiaj5nemgylrn6qex6vnpqzkfe5xsypkz4pmoavsw5jlpj7cf2gt2a/"

describe("Galaget", function () {
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
        await expect(galaget.connect(addr1).withdraw()).to.be.rejected;
        // Contract balance should still be 0.02 ETH.
        expect(await galaget.provider.getBalance(galaget.address)).to.equal(ethers.utils.parseEther("0.02"));
        const previousOwnerBalance = await owner.getBalance();
        // console.log(formatEther(previousOwnerBalance));
        // Contract should allow contract owner to withdraw all funds.
        await expect(galaget.withdraw()).to.eventually.be.fulfilled;
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
    it("Should support Rarible royalties interface", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const result = await galaget.supportsInterface("0xcad96cca");
        expect(result).to.equal(true);
    });
    it("Minted tokens should have Rarible royalties of 4 percent", async () => {
        const Galaget = await ethers.getContractFactory("Galaget");
        const galaget = await Galaget.deploy(NAME, SYMBOL, BASE_URI);
        await galaget.deployed();
        const [owner] = await ethers.getSigners();
        await galaget.mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        const royaltyInfo = (await galaget.getRaribleV2Royalties(0))[0];
        expect(royaltyInfo.account).to.equal(owner.address);
        // 400 Basis points is 4%
        expect(royaltyInfo.value).to.equal(BigNumber.from(400));
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
        await galaget.mintToken({
            value: ethers.utils.parseEther("0.02")
        });
        // Test with sale price of 1 ETH
        const royaltyInfo = await galaget.royaltyInfo(0, ethers.utils.parseEther("1"));
        expect(royaltyInfo.receiver).to.equal(owner.address);
        expect(royaltyInfo.royaltyAmount).to.equal(ethers.utils.parseEther("0.04"));
    });
});

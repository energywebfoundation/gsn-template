import { expect } from "chai";
import { ethers } from "hardhat";
import { Wallet, Contract, BigNumber } from "ethers";

const EMPTY_WALLET = "0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5";

describe("Auction", () => {
    let auction: Contract;
  
    beforeEach(async function () {
      const Auction = await ethers.getContractFactory("Auction");
      
      auction = await Auction.deploy();
      await auction.deployed();
    });

    it("Should be able to post a new bid", async () => {
        expect((await auction.highestBid()).eq(0));

        const newBid = 1;
        const bidTx = await auction.bid({ value: newBid });

        await bidTx.wait();

        expect((await auction.highestBid()).eq(newBid));
    });

    it("Should be able subsidize gas for posting a new bid", async () => {
        const highestBid: BigNumber = await auction.highestBid();
        const emptyWallet = new Wallet(EMPTY_WALLET, auction.provider);

        const auctionWithEmpty = auction.connect(emptyWallet);

        const newBid = highestBid.add(1);
        const bidTx = await auctionWithEmpty.bid({ value: highestBid.add(1) });

        await bidTx.wait();

        expect((await auction.highestBid()).eq(newBid));
    });
});

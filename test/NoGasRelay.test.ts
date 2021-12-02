import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract} from "ethers";

describe("No gas relay", () => {
    let auction: Contract;
  
    beforeEach(async () => {
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
});

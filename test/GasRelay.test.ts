import { GsnTestEnvironment } from '@opengsn/cli/dist/GsnTestEnvironment';
import { RelayProvider } from '@opengsn/provider';
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

import HttpProvider from 'web3-providers-http';

const WEB3_URL = 'http://127.0.0.1:8545';

describe("Gas relaying using GSN", () => {
    let auction: Contract;
    let from: string;
 
    beforeEach(async () => {
        let env = await GsnTestEnvironment.startGsn(WEB3_URL);
        const { paymasterAddress, forwarderAddress } = env.contractsDeployment;

        // @ts-ignore
        const web3provider = new HttpProvider(WEB3_URL);

        const AuctionGSN = await ethers.getContractFactory("AuctionGSN");
        auction = await AuctionGSN.deploy(forwarderAddress);
        await auction.deployed();

        const gsnProvider = await RelayProvider.newProvider({
            provider: web3provider, 
            config: {
                paymasterAddress: paymasterAddress
            }
        }).init();

        const account = new ethers.Wallet(Buffer.from('1'.repeat(64),'hex'));

        gsnProvider.addAccount(account.privateKey);
    	from = account.address;

        // @ts-ignore
        const gsnProviderEthers = new ethers.providers.Web3Provider(gsnProvider);

        auction = auction.connect(gsnProviderEthers.getSigner(from));
    });

    it("Should be able to subsidize gas for posting a new bid", async () => {
        const highestBid: BigNumber = await auction.highestBid();

        const newBid = highestBid.add(1);
        const bidTx = await auction.bid({ value: highestBid.add(1) });

        await bidTx.wait();

        expect((await auction.highestBid()).eq(newBid));
    });
});

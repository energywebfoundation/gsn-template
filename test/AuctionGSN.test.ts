// import { GsnTestEnvironment } from '@opengsn/cli/dist/GsnTestEnvironment';
import { RelayProvider } from '@opengsn/provider';
import { expect } from "chai";
import { ethers } from "hardhat";
import { Wallet, Contract, BigNumber } from "ethers";

import HttpProvider from 'web3-providers-http';

const EMPTY_WALLET = "0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5";
const WEB3_URL = 'http://localhost:8545';

describe("AuctionGSN", () => {
    let auction: Contract;
 
    beforeEach(async () => {
        const StakeManager = await ethers.getContractFactory("StakeManager");
        const stakeManager = await StakeManager.deploy(10000000);
        await stakeManager.deployed();

        const Penalizer = await ethers.getContractFactory("Penalizer");
        const penalizer = await Penalizer.deploy(5, 60000);
        await penalizer.deployed();

        const Forwarder = await ethers.getContractFactory("Forwarder");
        const forwarder = await Forwarder.deploy();
        await forwarder.deployed();

        const RelayHub = await ethers.getContractFactory("RelayHub");
        const relayHub = await RelayHub.deploy(
            stakeManager.address,
            penalizer.address,
            10,
            100000,
            15066,
            33135,
            BigNumber.from('2000000000000000000'),
            1000,
            BigNumber.from('1000000000000000000'),
            13,
            22414
        );
        await relayHub.deployed();

        const WhitelistPaymaster = await ethers.getContractFactory("WhitelistPaymaster");
        const paymaster = await WhitelistPaymaster.deploy();
        await paymaster.deployed();

        await paymaster.setRelayHub(relayHub.address);
        await paymaster.setTrustedForwarder(forwarder.address);

        // let env = await GsnTestEnvironment.startGsn(WEB3_URL);
        // const { paymasterAddress, forwarderAddress } = env.contractsDeployment;

        // @ts-ignore
        const web3provider = new HttpProvider(WEB3_URL);

        const AuctionGSN = await ethers.getContractFactory("AuctionGSN");
        auction = await AuctionGSN.deploy(forwarder.address);
        await auction.deployed();

        console.log({
            web3provider,
            hubAddr: await paymaster.getHubAddr()
        })

        const gsnProvider = await RelayProvider.newProvider({
            provider: web3provider, 
            config: {
                paymasterAddress: paymaster.address
            }
        }).init();

        // @ts-ignore
        const etherProvider = new ethers.providers.Web3Provider(gsnProvider);

        auction = await auction.connect(etherProvider);
    });

    it("Should be able to subsidize gas for posting a new bid", async () => {
        const highestBid: BigNumber = await auction.highestBid();
        const emptyWallet = new Wallet(EMPTY_WALLET, auction.provider);

        const newBid = highestBid.add(1);
        const bidTx = await auction.bid({ value: highestBid.add(1) });

        await bidTx.wait();

        expect((await auction.highestBid()).eq(newBid));
    });
});

import '@nomiclabs/hardhat-ethers';

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: "0.8.10",
    networks: {
        hardhat: { 
            chainId: 1337,
            allowUnlimitedContractSize: true
        }
    }
};

export default config;
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { APTOS_NETWORK, APTOS_NODE_URL } from "@/constants/contracts";

const networkByName: Record<string, Network> = {
    mainnet: Network.MAINNET,
    testnet: Network.TESTNET,
    devnet: Network.DEVNET,
    local: Network.LOCAL
};

const selectedNetwork = networkByName[APTOS_NETWORK.toLowerCase()] ?? Network.TESTNET;

export const aptosClient = new Aptos(
    new AptosConfig({
        network: selectedNetwork,
        fullnode: APTOS_NODE_URL
    })
);

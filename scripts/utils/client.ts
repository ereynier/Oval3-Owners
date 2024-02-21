/* return a client for the chain */
import { createPublicClient, http } from "viem";
import { chain, chainRpc } from "./chains";

export const client = createPublicClient({
    chain: chain,
    transport: http(chainRpc),
})

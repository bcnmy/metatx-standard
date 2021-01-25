import { ChainIds } from "@taquito/taquito";
import { NetworkType } from "@airgap/beacon-sdk";

export const config = {
  rpcUrl: "https://delphinet-tezos.giganode.io",
  quoteContractAddress: "KT18kvCsp28PiXf1DhuqpqbHfStj7QbdkJYN",
  network: NetworkType.DELPHINET.toString(),
  chainId: ChainIds.DELPHINET.toString(),
};

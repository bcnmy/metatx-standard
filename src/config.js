import { ChainIds } from "@taquito/taquito";
import { NetworkType } from "@airgap/beacon-sdk";

export const config = {
  rpcUrl: "https://florencenet.smartpy.io",
  quoteContractAddress: "KT1KYk2qjHX4Um5DzMu5QShJKofAjnsb7QJk",
  network: NetworkType.FLORENCENET.toString(),
  chainId: ChainIds.FLORENCENET.toString(),
};

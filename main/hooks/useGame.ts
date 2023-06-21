import { useEffect, useState } from "react";
import { sepolia, useAccount } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import rps from "../contracts/Rps.json";
import hasher from "../contracts/Hasher.json";
import {
  Address,
  Hex,
  createWalletClient,
  custom,
  encodeFunctionData,
  getContractAddress,
  keccak256,
  parseEther,
  toHex,
  toRlp,
} from "viem";
import { eMove } from "../enums";
import { useRouter } from "next/router";

const salt = !process.env.NEXT_PUBLIC_MY_SALT;
const useGame = () => {
  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  const publicClient = getPublicClient();
  const { address, isConnected } = useAccount();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [concealedMove, setConcealedMove] = useState<string>();

  const router = useRouter();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected]);

  const calculateNextAddress = async () => {
    if (address) {
      // the address of the next transaction depends on the current number of transactions this address has made until now
      const nonce: number = await publicClient.getTransactionCount({
        address,
      });
      const nextAddress = await getContractAddress({
        from: address,
        nonce: BigInt(nonce),
      });
      return nextAddress;
    }
  };

  const create = async (_j2: Address, stake: number) => {
    setIsCreating(true);
    const hash = await walletClient.deployContract({
      account: address as Hex,
      bytecode: rps.bytecode as Hex,
      abi: rps.abi,
      args: [concealedMove, _j2],
      ...{ value: parseEther(`${stake}`) }, // staked ether
    });

    // get receipt of the successfully completed transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt) {
      localStorage.setItem(
        "contract_address",
        JSON.stringify(receipt.contractAddress)
      );
      router.push(`/game/${receipt.contractAddress}`);
    }
    setIsCreating(false);
  };

  const concealMove = async (move: eMove, contractAddress?: any) => {
    const nextAddress = contractAddress || (await calculateNextAddress());
    const msg = `I approve that my move for the ${`${nextAddress}`.toLowerCase()}'s game is [${
      eMove[move]
    }]`;
    if (address) {
      const signature = await walletClient.signMessage({
        account: address,
        message: msg,
      });
      const encoded = keccak256(toRlp([signature, toHex(salt)]));
      const hashFuncData = encodeFunctionData({
        abi: hasher.abi,
        functionName: "hash",
        args: [move, encoded],
      });
      // hasher contract address: 0x4ecfaf452b9e6485d3645f2049e7ecd53c1bf75e
      const { data: hash } = await publicClient.call({
        account: address,
        data: hashFuncData,
        to: "0x4ecfaf452b9e6485d3645f2049e7ecd53c1bf75e",
      });
      localStorage.setItem("move", JSON.stringify(move));
      setConcealedMove(hash);
      return { hash, encoded };
    }
  };

  return { isCreating, create, concealMove, concealedMove };
};
export default useGame;

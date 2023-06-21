import { ModalRPS } from "@/main/components";
import { Spin, Typography, message } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, formatEther, getContract } from "viem";
import rps from "@/main/contracts/Rps.json";
import { getPublicClient } from "@wagmi/core";
import { useAccount } from "wagmi";
import { OpponentGame, PlayerGame } from "@/main/views";
import { useRouter } from "next/router";

const Game: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [contractAddress, setContractAddress] = useState<Address>();
  const [contract, setContract] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpponent, setIsOpponent] = useState<boolean>(false);
  const { address } = useAccount();
  const publicClient = getPublicClient();
  const router = useRouter();
  const { Link } = Typography;

  const handleGetOpponentAddress = useCallback(async () => {
    try {
      if (address) {
        const arr = router.asPath.split("/");
        const contract_address = arr[arr.length - 1] as Address;
        if (contract_address) {
          setContractAddress(contract_address);
          const contractInstance = getContract({
            address: contract_address,
            abi: rps.abi,
            publicClient,
          });
          setContract(contractInstance);
          const stake = await contractInstance.read.stake();
          const player = await contractInstance.read.j1();
          const opponent = await contractInstance.read.j2();
          if (
            Number(formatEther(stake as any)) === 0 ||
            (player !== address && opponent !== address)
          ) {
            router.push("/");
            return;
          }
          setIsOpponent(opponent === address);
        }
        setIsLoading(false);
      }
    } catch (err) {
      router.push("/");
      localStorage.clear();
      console.log(err);
    }
  }, [address]);

  useEffect(() => {
    handleGetOpponentAddress();
  }, [handleGetOpponentAddress]);

  return (
    <>
      {contextHolder}
      {isLoading ? (
        <Spin />
      ) : isOpponent ? (
        <OpponentGame
          contract={contract}
          setMessage={(msg: string, error?: boolean) =>
            error ? messageApi.error(msg) : messageApi.info(msg)
          }
        />
      ) : (
        <PlayerGame
          contract={contract}
          setMessage={(msg: string, error?: boolean) =>
            error ? messageApi.error(msg) : messageApi.info(msg)
          }
        />
      )}
      {!isLoading && (
        <ModalRPS title="Send This Link to your Opponent" open={!isOpponent}>
          <Link>{`${window.location}`}</Link>
        </ModalRPS>
      )}
    </>
  );
};

export default Game;

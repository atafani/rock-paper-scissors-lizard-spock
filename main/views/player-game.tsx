import { Button, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import {
  AbiItem,
  Address,
  createWalletClient,
  custom,
  formatEther,
} from "viem";
import rps from "../contracts/Rps.json";
import { getPublicClient } from "@wagmi/core";
import { useCountdown, useGame } from "../hooks";
import { eMove } from "../enums";
import { sepolia, useAccount, useBalance, useContractReads } from "wagmi";
import { useRouter } from "next/router";

type PlayerGameProps = {
  contract: any;
  setMessage: (msg: string, error?: boolean) => void;
};

const PlayerGame: React.FC<PlayerGameProps> = (props: PlayerGameProps) => {
  const { contract, setMessage } = props;
  const { countdown } = useCountdown(contract);
  const { concealMove } = useGame();
  const { address } = useAccount();
  const {
    data: balanceData,
    isError,
    isLoading,
  } = useBalance({
    address,
  });
  const router = useRouter();
  const [moveSelected, setMoveSelected] = useState<any>(eMove.Null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const publicClient = getPublicClient();
  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  const { data, isFetched } = useContractReads({
    contracts: [
      {
        address: contract?.address,
        abi: rps.abi as AbiItem[],
        functionName: "j1",
      },
      {
        address: contract?.address,
        abi: rps.abi as AbiItem[],
        functionName: "c1Hash",
      },
      {
        address: contract?.address,
        abi: rps.abi as AbiItem[],
        functionName: "stake",
      },
      {
        address: contract?.address,
        abi: rps.abi as AbiItem[],
        functionName: "c2",
      },
    ],
    watch: true,
  });
  const { Title, Paragraph, Text } = Typography;

  const handleTimeout = async () => {
    setIsSubmitting(true);
    try {
      await contract.read.j2Timeout();
      const { request } = await publicClient.simulateContract({
        address: contract.address,
        abi: rps.abi,
        functionName: "j2Timeout",
        account: address,
      });
      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setMessage("You lost", true);
      router.push("/");
      localStorage.clear();
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const handleRevealMove = async () => {
    setIsSubmitting(true);
    try {
      const c1Hash = await contract.read.c1Hash();
      const storedMove = localStorage.getItem("move");
      if (storedMove) {
        const move = JSON.parse(storedMove);
        const result = await concealMove(move, contract.address);
        if (result && result.hash === c1Hash) {
          const { request } = await publicClient.simulateContract({
            address: contract.address,
            abi: rps.abi,
            functionName: "solve",
            args: [move, result.encoded],
            account: address,
          });
          const hash = await walletClient.writeContract(request);
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });
        }
        const balance = await publicClient.getBalance({
          address: address as Address,
        });
        Number(formatEther(balance as any)) > Number(balanceData?.formatted)
          ? setMessage("You won")
          : setMessage("You lost", true);
        router.push("/");
        localStorage.clear();
      }
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    data?.[3].status === "success" && setMoveSelected(data?.[3].result);
    if (Number(formatEther(data?.[2].result as any)) === 0) {
      router.push("/");
      localStorage.clear();
    }
  }, [data]);

  return (
    <div className="PlayerGame-container">
      <Title className="title" level={3}>
        {moveSelected
          ? "Opponent chose his move."
          : "Opponent is choosing his move."}
      </Title>
      <Text type="warning">{`${
        countdown
          ? `${parseInt(`${countdown / 60}`)}:${parseInt(`${countdown % 60}`)}`
          : 0
      } Minute${countdown === 1 ? "" : "s"} until ${
        moveSelected
          ? "the opponent can time you out"
          : "you can time the opponent out"
      }`}</Text>
      <Button
        type="primary"
        className="btn"
        onClick={moveSelected ? handleRevealMove : handleTimeout}
        disabled={
          moveSelected === eMove.Null &&
          (countdown === undefined || countdown > 0)
        }
      >
        {isSubmitting ? (
          <Spin />
        ) : moveSelected ? (
          "Reveal your Move"
        ) : (
          "Oponent Timeout"
        )}
      </Button>
    </div>
  );
};

export default PlayerGame;

import { Button, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import {
  AbiItem,
  createWalletClient,
  custom,
  formatEther,
  parseEther,
} from "viem";
import rps from "../contracts/Rps.json";
import { getPublicClient } from "@wagmi/core";
import { sepolia, useAccount, useContractReads } from "wagmi";
import { eMove } from "../enums";
import SignContainer from "./sign-container";
import { useCountdown } from "../hooks";
import { useRouter } from "next/router";
type OpponentGameProps = {
  contract: any;
  setMessage: (msg: string, error?: boolean) => void;
};
const OpponentGame: React.FC<OpponentGameProps> = (
  props: OpponentGameProps
) => {
  const { contract, setMessage } = props;
  const { countdown } = useCountdown(contract);
  const [selectedMove, setSelectedMove] = useState<eMove>(eMove.Null);
  const [moveSelected, setMoveSelected] = useState<any>(eMove.Null);
  const [stake, setStake] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
        functionName: "j2",
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
  const router = useRouter();
  const { address } = useAccount();
  const { Title, Paragraph, Text } = Typography;
  const publicClient = getPublicClient();
  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  const handleSubmitMove = async () => {
    setIsSubmitting(true);
    try {
      const stake = await contract.read.stake();
      const { request } = await publicClient.simulateContract({
        address: contract.address,
        abi: rps.abi,
        functionName: "play",
        args: [selectedMove],
        account: address,
        value: parseEther(`${Number(formatEther(stake))}`), // staked ether
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };
  const handleTimeout = async () => {
    setIsSubmitting(true);
    try {
      await contract.read.j1Timeout();
      const { request } = await publicClient.simulateContract({
        address: contract.address,
        abi: rps.abi,
        functionName: "j1Timeout",
        account: address,
      });
      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setIsSubmitting(false);
      setMessage("You won");
      router.push("/");
      localStorage.clear();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    data?.[2].status === "success" &&
      setStake(Number(formatEther(data?.[2].result as any)));
    data?.[3].status === "success" && setMoveSelected(data?.[3].result);
  }, [data]);

  return (
    <div className="OpponentGame-container">
      <SignContainer
        move={moveSelected || selectedMove}
        setMove={setSelectedMove}
        disabled={!!moveSelected}
      />
      <Title level={5}>{`Stake: ${stake} ETH`}</Title>
      <Text type="warning">{`${
        countdown
          ? `${parseInt(`${countdown / 60}`)}:${parseInt(`${countdown % 60}`)}`
          : 0
      } Minute${countdown === 1 ? "" : "s"} until ${
        !moveSelected
          ? "the opponent can time you out"
          : "you can time the opponent out"
      }`}</Text>
      {moveSelected === eMove.Null && (
        <Button
          type="primary"
          className="btn"
          size="large"
          disabled={selectedMove === eMove.Null || moveSelected}
          onClick={handleSubmitMove}
        >
          {isSubmitting ? <Spin /> : "Submit Move"}
        </Button>
      )}

      {moveSelected !== eMove.Null && (
        <>
          <Button
            type="primary"
            className="btn"
            onClick={handleTimeout}
            disabled={countdown === undefined || countdown > 0}
          >
            {isSubmitting ? <Spin /> : "Oponent Timeout"}
          </Button>
        </>
      )}
    </div>
  );
};

export default OpponentGame;

import "./home.css";
import { Layout, ModalRPS } from "../../main/components";
import { Button, Input, InputNumber, Spin, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { eMove } from "../../main/enums";
import { Address, useAccount, useBalance } from "wagmi";
import useGame from "../../main/hooks/useGame";
import { SignContainer } from "../../main/views";
import { getContract } from "viem";
import rps from "../../main/contracts/Rps.json";
import { getPublicClient } from "@wagmi/core";
import { useRouter } from "next/router";

const Home: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address,
  });
  const [contract, setContract] = useState<any>();
  const { concealMove, concealedMove, isCreating, create } = useGame();

  const [messageApi, contextHolder] = message.useMessage();
  const publicClient = getPublicClient();

  const [selectedMove, setSelectedMove] = useState<eMove>(eMove.Null);
  const [staked, setStaked] = useState<number | null>();
  const [opponentAddress, setOpponentAddress] = useState<any>("");

  const { Title, Paragraph, Text } = Typography;

  const handleConcealMove = async () => {
    if (selectedMove === eMove.Null) {
      messageApi.error("Choose Your Move");
      return;
    }
    if (opponentAddress === address) {
      messageApi.error("Enter a valid opponent");
      return;
    }
    try {
      await concealMove(selectedMove);
    } catch (err) {
      console.error("Error", err);
    }
  };

  const handleStartGame = async () => {
    try {
      if (opponentAddress) {
        const res = await create(opponentAddress, staked || 0);
      }
    } catch (err) {
      console.error("Error", err);
    }
  };
  const handleUserRedirect = useCallback(async () => {
    const add = localStorage.getItem("contract_address");
    if (add) {
      const contractAddress = JSON.parse(add) as Address;
      if (address && contractAddress) {
        const contractInstance = getContract({
          address: contractAddress,
          abi: rps.abi,
          publicClient,
        });
        setContract(contractInstance);
        if (contractInstance) {
          const stake = await contractInstance.read.stake();
          const player = await contractInstance.read.j1();
          stake !== 0 && player === address
            ? router.push(`/game/${contractInstance.address}`)
            : localStorage.clear();
        }
      }
    }
  }, [address]);

  useEffect(() => {
    handleUserRedirect();
  }, [handleUserRedirect]);

  return (
    <>
      {" "}
      {contextHolder}
      <div>
        <SignContainer move={selectedMove} setMove={setSelectedMove} />
        <div className="game-details">
          <div>
            <Title level={5} className="title">
              Enter the Address of the Opponent
            </Title>
            <Input
              className="opponent-input"
              type="text"
              value={opponentAddress}
              onChange={(e) => setOpponentAddress(e.target.value)}
              placeholder="0x5315...."
            />
          </div>
          <div className="stake-container">
            <Text>
              <Text className="title">
                <b>Currently Staked: </b>
              </Text>
              <Text>{`${staked || 0} ${data?.symbol}`}</Text>
            </Text>
            <ModalRPS
              type="dashed"
              label="Stake"
              showFooter={true}
              title={`Stake some ${data?.symbol} to play`}
              onCancel={() => {
                if (staked && staked < 0) setStaked(null);
              }}
            >
              <Paragraph>
                Current Balance:{" "}
                {isLoading ? (
                  <Spin />
                ) : (
                  parseFloat(data?.formatted || "").toFixed(4)
                )}
                {data?.symbol}
              </Paragraph>

              <InputNumber
                value={staked}
                onChange={setStaked}
                min={0}
                step={0.0001}
                max={
                  !isLoading
                    ? parseFloat(parseFloat(data?.formatted || "").toFixed(4))
                    : undefined
                }
                addonAfter={data?.symbol}
              />
            </ModalRPS>
          </div>

          <Button
            className="start-btn btn"
            type="primary"
            size="large"
            disabled={!staked || !opponentAddress}
            onClick={!concealedMove ? handleConcealMove : handleStartGame}
          >
            {isCreating ? (
              <Spin />
            ) : !concealedMove ? (
              "Conceal Your Move"
            ) : (
              "Create Game"
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Home;

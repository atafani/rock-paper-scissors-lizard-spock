import { useEffect, useState } from "react";
import { AbiItem } from "viem";
import { useContractReads } from "wagmi";

const useCountdown = (contract: any) => {
  const [countdown, setCountdown] = useState<number>();

  const { data, isFetched } = useContractReads({
    contracts: [
      {
        address: contract?.address,
        abi: contract?.abi as AbiItem[],
        functionName: "TIMEOUT",
      },
      {
        address: contract?.address,
        abi: contract?.abi as AbiItem[],
        functionName: "lastAction",
      },
    ],
    watch: true,
  });
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (data && contract) {
          const now = new Date();
          const timeout = data[0].result;
          const lastAction = data[1].result;
          const diff =
            now.getTime() - new Date(Number(lastAction) * 1000).getTime();
          setCountdown(
            Number(timeout) > diff / 1000 ? Number(timeout) - diff / 1000 : 0
          );
          if (Number(timeout) < diff / 1000) clearInterval(interval);
        } else {
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
        clearInterval(interval); // ensure the interval is cleared when an error is thrown
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [contract, data]);
  return { countdown };
};
export default useCountdown;

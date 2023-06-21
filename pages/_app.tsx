import { Layout } from "@/main/components";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createConfig, sepolia } from "wagmi";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { useEffect, useState } from "react";
import { Spin } from "antd";

export default function App({ Component, pageProps }: AppProps) {
  const [config, setConfig] = useState<any>();
  useEffect(() => {
    setConfig(
      createConfig({
        autoConnect: true,
        publicClient: createPublicClient({
          chain: sepolia,
          transport: custom(window.ethereum),
        }),
      })
    );
  }, []);

  return !config ? (
    <Spin />
  ) : (
    <WagmiConfig config={config}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WagmiConfig>
  );
}

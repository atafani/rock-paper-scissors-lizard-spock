import { Button, Spin, Typography, message } from "antd";
import { ReactNode } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

type LayoutProps = {
  children: ReactNode;
};
const Layout = (props: LayoutProps) => {
  const { children } = props;
  const { Title, Paragraph, Text } = Typography;
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  return (
    <div className="layout-container">
      <Title className="game-title">Rock Paper Scissors Lizard Spock</Title>
      {isConnected ? (
        children
      ) : (
        <div className="connection-container">
          <Button
            className="btn connect-btn"
            size="large"
            onClick={() => connect()}
          >
            {isConnecting ? <Spin /> : "Connect Wallet"}
          </Button>
        </div>
      )}
    </div>
  );
};
export default Layout;

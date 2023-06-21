import { Divider, Typography } from "antd";
import { eMove } from "../enums";
import { SignButton } from "../components";

type SignContainerProps = {
  move: eMove;
  setMove: (value: eMove) => void;
  disabled?: boolean;
};
const SignContainer: React.FC<SignContainerProps> = (
  props: SignContainerProps
) => {
  const { move, setMove, disabled = false } = props;

  const { Title, Paragraph, Text } = Typography;

  return (
    <>
      <Title level={4} className="moves-title">
        {disabled ? "You chose" : " Choose Your Move"}
      </Title>
      <div className="moves-container">
        <SignButton
          selected={move === eMove.Rock}
          src="/images/rock.png"
          onSignClick={() => setMove(eMove.Rock)}
          disabled={disabled}
        />
        <SignButton
          selected={move === eMove.Paper}
          src="/images/paper.png"
          onSignClick={() => setMove(eMove.Paper)}
          disabled={disabled}
        />
        <SignButton
          selected={move === eMove.Scissors}
          src="/images/scissors.png"
          onSignClick={() => setMove(eMove.Scissors)}
          disabled={disabled}
        />
        <SignButton
          selected={move === eMove.Lizard}
          src="/images/lizard.png"
          onSignClick={() => setMove(eMove.Lizard)}
          disabled={disabled}
        />
        <SignButton
          selected={move === eMove.Spock}
          src="/images/spock.png"
          onSignClick={() => setMove(eMove.Spock)}
          disabled={disabled}
        />
      </div>
      <Divider />
    </>
  );
};

export default SignContainer;

import { useEffect, useState } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Queue } from "../components/Queue";
import { nameSelector } from "../recoil/name";
import { styled } from "../theme";
import { GameDoc } from "../types/firestore";
import { collection, doc } from "../util/firestore";
import { shouldUpdateGame, updateGame } from "../util/update";

const Wrapper = styled.div`
  padding: 10px;
`;

export const Game: React.FC = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [name] = useRecoilState(nameSelector);

  if (name === "" || gameId === "") {
    return <Navigate to="/" replace={true} />;
  }

  const [gameDoc, loading, error] = useDocument<GameDoc>(
    doc(collection(undefined, "games"), gameId!)
  );

  const [updating, setUpdating] = useState(false);

  // Update game info in firebase if needed
  useEffect(() => {
    (async () => {
      if (shouldUpdateGame(gameDoc)) {
        setUpdating(true);
        await updateGame(gameId!);
        setUpdating(false);
      }
    })();
  }, [gameDoc]);

  if (loading || !gameDoc || !gameDoc.data()) {
    return <p>Loading...</p>;
  }

  if (updating || gameDoc?.exists() === false) {
    return <p>Populating game data...</p>;
  }

  // if we got this far, the doc exists, so we will assume the data is defined
  const game = gameDoc.data()!;

  return (
    <Wrapper>
      <h2>
        {game.name} ({gameId})
      </h2>
      <p>Game info last updated {game.lastUpdated.toDate().toString()}</p>
      <Queue gameDoc={gameDoc} />
    </Wrapper>
  );
};

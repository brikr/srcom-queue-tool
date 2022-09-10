import { formatDistanceToNow } from "date-fns";
import { DocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useQueueView } from "../hooks/queueView";
import { nameSelector } from "../recoil/name";
import { styled } from "../theme";
import { GameDoc } from "../types/firestore";
import { shouldUpdateGameQueue, updateGameQueue } from "../util/update";
import { Run } from "./Run";

interface Props {
  gameDoc: DocumentSnapshot<GameDoc>;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const DEFAULT_COPY_BUTTON_TEXT = "Copy claimed VOD URLs";

export const Queue: React.FC<Props> = ({ gameDoc }) => {
  const { runs, runsAssignedToMe, hiddenRuns, loading, error } =
    useQueueView(gameDoc);
  const [name] = useRecoilState(nameSelector);
  const [updating, setUpdating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState(
    DEFAULT_COPY_BUTTON_TEXT
  );

  // Update queue in firebase if needed
  useEffect(() => {
    (async () => {
      if (shouldUpdateGameQueue(gameDoc)) {
        setUpdating(true);
        await updateGameQueue(gameDoc);
        setUpdating(false);
      }
    })();
  }, [gameDoc]);

  const handleUpdateQueueClick = async () => {
    setUpdating(true);
    await updateGameQueue(gameDoc);
    setUpdating(false);
  };

  const handleCopyVODsClick = async () => {
    const vodsAssignedToMe = runsAssignedToMe
      .map((run) => run.data().videos)
      .flat();
    await navigator.clipboard.writeText(vodsAssignedToMe.join("\n"));
    setCopyButtonText("Copied to clipboard");
    setTimeout(() => {
      setCopyButtonText(DEFAULT_COPY_BUTTON_TEXT);
    }, 2000);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (updating) {
    return <p>Populating queue...</p>;
  }

  // Right after updating this field, it is briefly null
  const lastUpdated = gameDoc.data()?.queueLastUpdated
    ? formatDistanceToNow(gameDoc.data()!.queueLastUpdated.toDate())
    : "";

  return (
    <>
      <h2>Queue</h2>
      <p>
        {runs.length} runs in queue. Last updated {lastUpdated} ago
      </p>
      <button onClick={handleUpdateQueueClick}>Update queue now</button>
      <button onClick={handleCopyVODsClick}>{copyButtonText}</button>
      <List>
        {runs.map((runDoc) => (
          <Run key={runDoc.id} runDoc={runDoc} gameDoc={gameDoc} />
        ))}
      </List>
      {hiddenRuns.length > 0 && (
        <>
          <h2>Hidden runs</h2>
          <p>
            Only you can see these. If they are verified, they will go away once
            the speedrun.com API updates
          </p>
          <List>
            {hiddenRuns.map((runDoc) => (
              <Run key={runDoc.id} runDoc={runDoc} gameDoc={gameDoc} />
            ))}
          </List>
        </>
      )}
    </>
  );
};

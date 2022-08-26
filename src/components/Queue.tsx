import { DocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRecoilState } from "recoil";
import { nameSelector } from "../recoil/name";
import { styled } from "../theme";
import { GameDoc, RunDoc } from "../types/firestore";
import { collection } from "../util/firestore";
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
  const [queueCollection, loading, error] = useCollection<RunDoc>(
    collection<RunDoc>(gameDoc.ref, "queue")
  );
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
    if (!queueCollection) {
      return;
    }

    const vodsAssignedToMe = queueCollection.docs
      .filter((doc) => doc.data().assignee === name)
      .map((doc) => doc.data().videos[0]);
    await navigator.clipboard.writeText(vodsAssignedToMe.join("\n"));
    setCopyButtonText("Copied to clipboard");
    setTimeout(() => {
      setCopyButtonText(DEFAULT_COPY_BUTTON_TEXT);
    }, 2000);
  };

  if (loading || !queueCollection) {
    return <p>Loading...</p>;
  }

  if (updating) {
    return <p>Populating queue...</p>;
  }

  // Right after updating this field, it is briefly null
  const lastUpdated =
    gameDoc.data()?.queueLastUpdated?.toDate().toString() ?? "";

  return (
    <div>
      <p>
        {queueCollection.size} runs in queue. Last updated {lastUpdated}
      </p>
      <button onClick={handleUpdateQueueClick}>Update queue now</button>
      <button onClick={handleCopyVODsClick}>{copyButtonText}</button>
      <List>
        {queueCollection.docs.map((doc) => (
          <Run key={doc.data().id} runDoc={doc} gameDoc={gameDoc} />
        ))}
      </List>
    </div>
  );
};

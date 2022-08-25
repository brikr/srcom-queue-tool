import { DocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
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

export const Queue: React.FC<Props> = ({ gameDoc }) => {
  const [queueCollection, loading, error] = useCollection<RunDoc>(
    collection<RunDoc>(gameDoc.ref, "queue")
  );
  const [updating, setUpdating] = useState(false);

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
      <List>
        {queueCollection.docs.map((doc) => (
          <Run key={doc.data().id} runDoc={doc} />
        ))}
      </List>
    </div>
  );
};

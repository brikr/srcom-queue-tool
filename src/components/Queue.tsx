import { formatDistanceToNow } from "date-fns";
import { DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useQueueView } from "../hooks/queueView";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { styled } from "../theme";
import { GameDoc, RunDoc } from "../types/firestore";
import { durationToMillis } from "../util/duration";
import { shouldUpdateGameQueue, updateGameQueue } from "../util/update";
import { Run } from "./Run";

interface Props {
  gameDoc: DocumentSnapshot<GameDoc>;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const DEFAULT_COPY_BUTTON_TEXT = "Copy claimed VOD URLs";

const COPY_SORTERS = {
  submitted: (
    runA: QueryDocumentSnapshot<RunDoc>,
    runB: QueryDocumentSnapshot<RunDoc>
  ) => {
    return runA.data().submitted.toMillis() - runB.data().submitted.toMillis();
  },
  duration: (
    runA: QueryDocumentSnapshot<RunDoc>,
    runB: QueryDocumentSnapshot<RunDoc>
  ) => {
    const aMs = durationToMillis(runA.data().time);
    const bMs = durationToMillis(runB.data().time);
    return aMs - bMs;
  },
};

export const Queue: React.FC<Props> = ({ gameDoc }) => {
  const { runs, runsAssignedToMe, hiddenRuns, loading, error } =
    useQueueView(gameDoc);
  const [updating, setUpdating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState(
    DEFAULT_COPY_BUTTON_TEXT
  );
  const copyOrderRef = useRef<HTMLSelectElement>(null);
  const [preferredCopyOrder, setPreferredCopyOrder] = useLocalStorage(
    "preferredCopyOrder",
    "submitted"
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
    const sortOrder = copyOrderRef.current!.value as "submitted" | "duration";

    const vodsAssignedToMe = runsAssignedToMe
      .sort(COPY_SORTERS[sortOrder])
      .filter((run) => !run.data().hidden)
      .map((run) => run.data().videos)
      .flat();
    await navigator.clipboard.writeText(vodsAssignedToMe.join("\n"));
    setCopyButtonText("Copied to clipboard");
    setTimeout(() => {
      setCopyButtonText(DEFAULT_COPY_BUTTON_TEXT);
    }, 2000);
  };

  const handleChangePreferredCopyOrder = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPreferredCopyOrder(e.target.value);
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
      <Controls>
        <button onClick={handleUpdateQueueClick}>Update queue now</button>
        <button onClick={handleCopyVODsClick}>{copyButtonText}</button>
        <label htmlFor="copyOrder">VOD URL order:</label>
        <select
          ref={copyOrderRef}
          id="copyOrder"
          defaultValue={preferredCopyOrder}
          onChange={handleChangePreferredCopyOrder}
        >
          <option value="submitted">Submission time (earliest first)</option>
          <option value="duration">Run duration (shortest first)</option>
        </select>
      </Controls>
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

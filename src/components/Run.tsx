import { DocumentSnapshot, setDoc } from "firebase/firestore";
import React from "react";
import { RunDoc } from "../types/firestore";

interface Props {
  runDoc: DocumentSnapshot<RunDoc>;
  onSelect?: (runId: string) => void;
}

export const Run: React.FC<Props> = ({ runDoc, onSelect }) => {
  const run = runDoc.data();

  if (!run) {
    return <p>Loading...</p>;
  }

  const handleSelect = async () => {
    onSelect?.(run.id);
    if (run.assignee) {
      await setDoc(runDoc.ref, { assignee: null }, { merge: true });
    } else {
      await setDoc(runDoc.ref, { assignee: "test" }, { merge: true });
    }
  };

  return (
    <div onClick={handleSelect}>
      <p>
        {run.category} in {run.time} by {run.runner}
      </p>
      {run.assignee && <p>Claimed by {run.assignee}</p>}
    </div>
  );
};

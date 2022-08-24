import { DocumentSnapshot } from "firebase/firestore";
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

  const handleSelect = () => {
    onSelect?.(run.id);
  };

  return (
    <div onClick={handleSelect}>
      <p>
        {run.category} in {run.time} by {run.runner}
      </p>
    </div>
  );
};

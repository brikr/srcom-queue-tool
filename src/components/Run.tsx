import { formatDistanceToNow } from "date-fns";
import { DocumentSnapshot, setDoc } from "firebase/firestore";
import React, { useMemo } from "react";
import { useRecoilState } from "recoil";
import { nameSelector } from "../recoil/name";
import { css, styled } from "../theme";
import { GameDoc, RunDoc } from "../types/firestore";
import { formatDuration } from "../util/duration";

interface Props {
  runDoc: DocumentSnapshot<RunDoc>;
  gameDoc: DocumentSnapshot<GameDoc>;
}

const Card = styled.div`
  ${({ theme }) => css`
    width: 600px;
    margin: 10px 0;
    padding: 10px 30px 10px 10px;
    border-radius: 5px;

    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    background: ${theme.colors.card};
    color: ${theme.colors.onCard};

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
    }

    cursor: pointer;
  `}
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const MainInfo = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

const ClaimedText = styled.p`
  margin-top: 0;
`;

export const Run: React.FC<Props> = ({ runDoc, gameDoc }) => {
  const [name] = useRecoilState(nameSelector);

  const game = gameDoc.data();
  const unmappedRun = runDoc.data();

  if (!unmappedRun) {
    return <p>Loading...</p>;
  }

  const run = useMemo(() => {
    const category = game?.categories[unmappedRun.category].name;

    return {
      ...unmappedRun,
      category,
      time: formatDuration(unmappedRun.time),
    };
  }, [unmappedRun, game]);

  const assignedToMe = run.assignee === name;

  const handleSelect = async () => {
    if (assignedToMe) {
      await setDoc(runDoc.ref, { assignee: null }, { merge: true });
    } else if (
      // run not assigned, or
      !run.assignee ||
      // run is assigned but override is accepted
      (run.assignee &&
        confirm(
          `This run is already claimed by ${run.assignee}. Do you want to take it from them?`
        ))
    ) {
      await setDoc(runDoc.ref, { assignee: name }, { merge: true });
    }
  };

  return (
    <Card onClick={handleSelect}>
      <input
        type="checkbox"
        checked={Boolean(run.assignee)}
        disabled={Boolean(run.assignee) && run.assignee !== name}
        readOnly
      />
      <CardContent>
        <MainInfo>
          <p>
            {run.category} in {run.time} by {run.runner}
          </p>
          <p>Submitted {formatDistanceToNow(run.submitted.toDate())} ago</p>
        </MainInfo>
        {run.assignee && <ClaimedText>Claimed by {run.assignee}</ClaimedText>}
      </CardContent>
    </Card>
  );
};

import { DocumentSnapshot, setDoc } from "firebase/firestore";
import React, { useMemo } from "react";
import { useRecoilState } from "recoil";
import { parse } from "tinyduration";
import { nameSelector } from "../recoil/name";
import { css, styled } from "../theme";
import { GameDoc, RunDoc } from "../types/firestore";

interface Props {
  runDoc: DocumentSnapshot<RunDoc>;
  gameDoc: DocumentSnapshot<GameDoc>;
}

const Card = styled.div`
  ${({ theme }) => css`
    width: 500px;
    margin: 10px 0;
    padding: 10px;
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

export const Run: React.FC<Props> = ({ runDoc, gameDoc }) => {
  const [name] = useRecoilState(nameSelector);

  const game = gameDoc.data();
  const unmappedRun = runDoc.data();

  if (!unmappedRun) {
    return <p>Loading...</p>;
  }

  const run = useMemo(() => {
    const category = game?.categories[unmappedRun.category].name;

    const parsedTime = parse(unmappedRun.time);

    const hours = parsedTime.hours ? `${parsedTime.hours}:` : "";
    let minutes = "0:";
    if (parsedTime.minutes) {
      minutes = `${parsedTime.minutes}:`;
      if (parsedTime.hours && parsedTime.minutes < 10) {
        minutes = `0${minutes}`;
      }
    }
    let seconds = "00";
    if (parsedTime.seconds) {
      seconds = String(parsedTime.seconds);
      if (parsedTime.minutes && parsedTime.seconds < 10) {
        seconds = `0${seconds}`;
      }
    }

    const time = `${hours}${minutes}${seconds}`;

    return {
      ...unmappedRun,
      category,
      time,
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
        disabled={run.assignee !== name}
        readOnly
      />
      <div>
        <p>
          {run.category} in {run.time} by {run.runner}
        </p>
        {run.assignee && <p>Claimed by {run.assignee}</p>}
      </div>
    </Card>
  );
};

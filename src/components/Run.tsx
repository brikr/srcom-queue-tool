import { formatDistanceToNow } from "date-fns";
import { DocumentSnapshot, setDoc } from "firebase/firestore";
import React, { useMemo } from "react";
import { useRecoilState } from "recoil";
import { nameSelector } from "../recoil/name";
import { css, styled } from "../theme";
import { GameDoc, RunDoc } from "../types/firestore";
import { durationToMillis, formatDuration } from "../util/duration";

interface Props {
  runDoc: DocumentSnapshot<RunDoc>;
  gameDoc: DocumentSnapshot<GameDoc>;
}

const Card = styled.a`
  ${({ theme }) => css`
    min-width: 600px;
    max-width: 800px;
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

    text-decoration: none;
  `}
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const CardRow = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
`;

const ClaimedText = styled.p`
  margin-top: 0;
`;

const ShoutOutTag = styled.span`
  margin-left: 7px;
  border: 1px solid darkblue;
  background-color: dodgerblue;
  color: whitesmoke;
  font-weight: bolder;
  padding: 2px 5px;
  border-radius: 5px;
  font-size: 0.7em;
  vertical-align: top;
`;

const SECONDS_MILLISECONDS = 1000;
const MINUTES_MILLISECONDS = 60 * SECONDS_MILLISECONDS;
const HOURS_MILLISECONDS = 60 * MINUTES_MILLISECONDS;

const shoutoutTimes: { [key: string]: number } = {
  "120 Star": HOURS_MILLISECONDS + 50 * MINUTES_MILLISECONDS, // 1h50
  "70 Star": 51 * MINUTES_MILLISECONDS, // 51m
  "16 Star": 16 * MINUTES_MILLISECONDS, // 16m
  "1 Star": 7 * MINUTES_MILLISECONDS + 40 * SECONDS_MILLISECONDS, // 7m40
  "0 Star": 7 * MINUTES_MILLISECONDS, // 7m
};

export const Run: React.FC<Props> = ({ runDoc, gameDoc }) => {
  const [name] = useRecoilState(nameSelector);

  const game = gameDoc.data();
  const unmappedRun = runDoc.data();

  if (!unmappedRun) {
    return <p>Loading...</p>;
  }

  const run = useMemo(() => {
    const category = game?.categories[unmappedRun.category].name;

    const level =
      game?.levels && unmappedRun.level
        ? game?.levels[unmappedRun.level]?.name
        : null;

    return {
      ...unmappedRun,
      category,
      level,
      time: formatDuration(unmappedRun.time),
      timeParsed: durationToMillis(unmappedRun.time),
    };
  }, [unmappedRun, game]);

  const assignedToMe = run.assignee === name;

  const handleSelect = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    const isMac = navigator.platform.toLowerCase().indexOf("mac") >= 0;

    if (event.ctrlKey || (isMac && event.metaKey)) {
      // do normal <a> behavior if ctrl is held down (i.e. open in new tab)
      return;
    }

    // otherwise, prevent the link from opening and claim/unclaim the run
    event.preventDefault();

    if (assignedToMe) {
      await setDoc(
        runDoc.ref,
        { assignee: null, hidden: false }, // always show a run if unassigning
        { merge: true }
      );
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

  const handleHideRun = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // don't fire handleSelect event
    e.stopPropagation();
    e.preventDefault();

    await setDoc(runDoc.ref, { hidden: true }, { merge: true });
  };

  const handleShowRun = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // don't fire handleSelect event
    e.stopPropagation();
    e.preventDefault();

    await setDoc(runDoc.ref, { hidden: false }, { merge: true });
  };

  const shoutoutTime = shoutoutTimes[run.category || ""];
  const isShoutout = run.timeParsed < shoutoutTime;

  return (
    <Card
      onClick={handleSelect}
      href={`https://speedrun.com/run/${run.id}`}
      target="_blank"
    >
      <input
        type="checkbox"
        checked={Boolean(run.assignee)}
        disabled={Boolean(run.assignee) && run.assignee !== name}
        readOnly
      />
      <CardContent>
        <CardRow>
          <p>
            {run.category}
            {run.level ? <> ({run.level})</> : null} in {run.time} by{" "}
            {run.runner}
            {run.videos.length === 0 && " (no video)"}
            {isShoutout && <ShoutOutTag>Shoutout</ShoutOutTag>}
          </p>
          <p>Submitted {formatDistanceToNow(run.submitted.toDate())} ago</p>
        </CardRow>
        <CardRow>
          {run.assignee && <ClaimedText>Claimed by {run.assignee}</ClaimedText>}
          {assignedToMe &&
            (run.hidden ? (
              <button onClick={handleShowRun}>Show run (woops)</button>
            ) : (
              <button onClick={handleHideRun}>Hide run (mark verified)</button>
            ))}
        </CardRow>
      </CardContent>
    </Card>
  );
};

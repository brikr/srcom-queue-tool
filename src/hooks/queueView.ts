import {
  DocumentSnapshot,
  FirestoreError,
  orderBy,
  query,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRecoilState } from "recoil";
import { GameDoc, RunDoc } from "../types/firestore";
import { collection } from "../util/firestore";
import { nameSelector } from "./../recoil/name";

interface QueueView {
  // all non-hidden runs
  runs: QueryDocumentSnapshot<RunDoc>[];
  // all runs assigned to current user
  runsAssignedToMe: QueryDocumentSnapshot<RunDoc>[];
  // all hidden runs assigned to current user
  hiddenRuns: QueryDocumentSnapshot<RunDoc>[];
  // these two are passed through from firestore hook
  loading: boolean;
  error?: FirestoreError;
}

export function useQueueView(gameDoc: DocumentSnapshot<GameDoc>): QueueView {
  const [queueCollection, loading, error] = useCollection<RunDoc>(
    query(collection<RunDoc>(gameDoc.ref, "queue"), orderBy("submitted", "asc"))
  );

  const [name] = useRecoilState(nameSelector);

  if (loading || error || !queueCollection) {
    return {
      runsAssignedToMe: [],
      runs: [],
      hiddenRuns: [],
      loading,
      error,
    };
  }

  // all non-hidden runs
  const runs = queueCollection.docs.filter((runDoc) => !runDoc.data().hidden);

  // runs assigned to current user
  const runsAssignedToMe = queueCollection.docs.filter(
    (runDoc) => runDoc.data().assignee === name
  );

  // hidden runs assigned to current user
  const hiddenRuns = runsAssignedToMe.filter((run) => run.data().hidden);

  return {
    runsAssignedToMe,
    runs,
    hiddenRuns,
    loading,
    error,
  };
}

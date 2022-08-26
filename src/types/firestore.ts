import { Timestamp } from "firebase/firestore";

export interface ViewerDoc {
  lastPing: Timestamp;
}

export interface ViewerCollection {
  [userId: string]: ViewerDoc;
}

export interface RunDoc {
  id: string;
  status: "new" | "verified" | "rejected";
  category: string;
  time: string;
  submitted: Timestamp;
  runner: string;
  platform: string;
  emulated: boolean;
  region: string;
  assignee?: string | null;
  videos: string[];
}
// collections:
// viewers: ViewerCollection

// A game's queue collection contains a RunDoc for each run pending verification.
// Their doc IDs are their respective speedrun.com run IDs
export interface QueueCollection {
  [runId: string]: RunDoc;
}

export interface GameDoc {
  name: string;
  srcomId: string;
  categories: {
    [categoryId: string]: {
      name: string;
    };
  };
  platforms: {
    [platformId: string]: {
      name: string;
    };
  };
  regions: {
    [regionId: string]: {
      name: string;
    };
  };
  variables: {
    [variableId: string]: {
      name: string;
      choices: {
        [choiceId: string]: {
          label: string;
        };
      };
    };
  };
  // Last time this game and its queue were updated
  lastUpdated: Timestamp;
  queueLastUpdated: Timestamp;
}
// collections:
// queue: QueueCollection

// The games collection contains a GameDoc for each game.
// Their doc IDs are their respective speedrun.com game *abbreviations*
export interface GameCollection {
  [gameId: string]: GameDoc;
}

export interface FirestoreRoot {
  games: GameCollection;
}

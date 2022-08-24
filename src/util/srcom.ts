import axios from "axios";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { GameDoc, RunDoc } from "../types/firestore";
import { ApiGame, ApiRun, ApiRuns } from "../types/srcom";

const API_BASE = "https://www.speedrun.com/api/v1";

function mapApiRun(apiRun: ApiRun): RunDoc {
  const run: RunDoc = {
    id: apiRun.id,
    status: apiRun.status.status,
    runner: apiRun.players.data[0].names.international,
    category: apiRun.category, // TODO
    time: apiRun.times.realtime,
    submitted: Timestamp.fromDate(new Date(apiRun.submitted)),
    platform: apiRun.system.platform, // TODO
    emulated: apiRun.system.emulated,
    region: apiRun.system.region, // TODO
  };

  return run;
}

// Get a run by ID
export async function getRun(id: string): Promise<RunDoc> {
  try {
    const response = await axios.get<{ data: ApiRun }>(
      `${API_BASE}/runs/${id}`,
      {
        params: {
          embed: "players",
        },
      }
    );

    return mapApiRun(response.data.data);
  } catch (e) {
    throw e;
  }
}

export async function getAllUnverifiedRuns(gameId: string): Promise<RunDoc[]> {
  const runs = [];
  let offset = 0;
  let size = 200;
  while (size === 200) {
    // Continue getting runs until we receive fewer than the amount we requested, meaning we hit the last page.
    try {
      const response = await axios.get<ApiRuns>(`${API_BASE}/runs`, {
        params: {
          game: gameId,
          status: "new",
          // Pagination params
          max: 200,
          offset,
          embed: "players",
        },
      });

      runs.push(response.data.data);

      // Next page
      size = response.data.pagination.size;
      offset += 200;
    } catch (e) {
      throw e;
    }
  }

  // Convert ApiRuns[] into Run[] and calculate flags
  return runs.reduce<RunDoc[]>((acc, val) => {
    const mapped = val.map<RunDoc>(mapApiRun);

    return acc.concat(mapped);
  }, []);
}

function mapApiGame(apiGame: ApiGame): GameDoc {
  const game: GameDoc = {
    name: apiGame.names.international,
    srcomId: apiGame.id,
    categories: apiGame.categories.data.reduce<GameDoc["categories"]>(
      (acc, curr) => {
        acc[curr.id] = {
          name: curr.name,
        };
        return acc;
      },
      {}
    ),
    platforms: apiGame.platforms.data.reduce<GameDoc["platforms"]>(
      (acc, curr) => {
        acc[curr.id] = {
          name: curr.name,
        };
        return acc;
      },
      {}
    ),
    regions: apiGame.regions.data.reduce<GameDoc["regions"]>((acc, curr) => {
      acc[curr.id] = {
        name: curr.name,
      };
      return acc;
    }, {}),
    variables: apiGame.variables.data.reduce<GameDoc["variables"]>(
      (acc, curr) => {
        acc[curr.id] = {
          name: curr.name,
          choices: Object.entries(curr.values.values).reduce<{
            [choiceId: string]: { label: string };
          }>((choicesAcc, [choiceId, { label }]) => {
            choicesAcc[choiceId] = {
              label,
            };
            return choicesAcc;
          }, {}),
        };
        return acc;
      },
      {}
    ),
    // using as Timestamp here is a little cheeky, but it makes the types nicer in _most_ places
    lastUpdated: serverTimestamp() as Timestamp,
    queueLastUpdated: serverTimestamp() as Timestamp, // technically not true, but hydrateGame will call updateGameQueue
  };

  return game;
}

export async function getGame(abbreviation: string): Promise<GameDoc> {
  try {
    const response = await axios.get<{ data: [ApiGame] }>(`${API_BASE}/games`, {
      params: {
        abbreviation,
        embed: "categories,platforms,regions,variables",
      },
    });

    return mapApiGame(response.data.data[0]);
  } catch (e) {
    throw e;
  }
}

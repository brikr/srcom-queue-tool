import axios from "axios";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { GameDoc, RunDoc } from "../types/firestore";
import { ApiGame, ApiRun, ApiRuns } from "../types/srcom";

const API_BASE = "https://www.speedrun.com/api/v1";

// Sanitize a video URL
// Removes all URL params other than `v`
function sanitizeVideoUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    const newSearchParams = new URLSearchParams();
    if (url.searchParams.has("v")) {
      newSearchParams.set("v", url.searchParams.get("v")!);
    }
    url.search = newSearchParams.toString();
    return url.toString();
  } catch (e) {
    // Not a valid URL. Just pass through for now
    return urlString;
  }
}

function mapApiRunVideos(apiRun: ApiRun): string[] {
  if (apiRun.videos?.links) {
    // we have nice links, just sanitize em and return
    return apiRun.videos.links.map((link) => sanitizeVideoUrl(link.uri));
  } else if (apiRun.videos?.text) {
    // there is text that is either a comment about no video (banned) or maybe just a url without protocol
    // try adding protocol and see if it's a valid url
    const maybeUrlString = `https://${apiRun.videos.text}`;
    try {
      const url = new URL(maybeUrlString);

      // if we get here, it is a url! sanitize and return
      return [sanitizeVideoUrl(url.toString())];
    } catch (e) {
      // it still isn't a url, assume no video
      return [];
    }
  } else {
    // can't find shit
    return [];
  }
}

function mapApiRun(apiRun: ApiRun): RunDoc {
  const run: RunDoc = {
    id: apiRun.id,
    status: apiRun.status.status,
    runner: apiRun.players.data[0].names.international,
    category: apiRun.category, // TODO
    level: apiRun.level,
    time: apiRun.times.realtime,
    submitted: Timestamp.fromDate(new Date(apiRun.submitted)),
    platform: apiRun.system.platform, // TODO
    emulated: apiRun.system.emulated,
    region: apiRun.system.region, // TODO
    videos: mapApiRunVideos(apiRun),
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

  // Convert ApiRuns[] into RunDoc[]
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
    levels: apiGame.levels.data.reduce<GameDoc["levels"]>((acc, curr) => {
      acc[curr.id] = {
        name: curr.name,
      };
      return acc;
    }, {}),
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
        embed: "categories,platforms,regions,variables,levels",
      },
    });

    return mapApiGame(response.data.data[0]);
  } catch (e) {
    throw e;
  }
}

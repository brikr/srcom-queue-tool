export interface ApiRun {
  id: string;
  game: string;
  status: {
    status: "new" | "verified" | "rejected";
    examiner: string;
    // If a run is verified, this is the datetime that it was verified
    "verify-date": string;
  };
  players: {
    data: Array<ApiUser>;
  };
  // If a run is rejected, then all we have to go off of is the submitted datetime
  submitted: string;
  category: string;
  level?: string | null;
  times: {
    realtime: string;
    ingame: string;
  };
  system: {
    platform: string;
    emulated: boolean;
    region: string;
  };
  values: { [key: string]: string };
  videos?: {
    links?: Array<{
      uri: string;
    }>;
    text?: string;
  };
}

export interface ApiUser {
  id: string;
  names: {
    international: string;
  };
}

export interface ApiRuns {
  data: ApiRun[];
  pagination: {
    size: number;
  };
}

interface ApiCategory {
  id: string;
  name: string;
}

interface ApiPlatform {
  id: string;
  name: string;
}

interface ApiRegion {
  id: string;
  name: string;
}

interface ApiVariable {
  id: string;
  name: string;
  values: {
    values: {
      [id: string]: {
        label: string;
      };
    };
  };
}

export interface ApiLevel {
  id: string;
  name: string;
}

export interface ApiGame {
  id: string;
  names: {
    international: string;
  };
  levels: {
    data: ApiLevel[];
  };
  categories: {
    data: ApiCategory[];
  };
  platforms: {
    data: ApiPlatform[];
  };
  regions: {
    data: ApiRegion[];
  };
  variables: {
    data: ApiVariable[];
  };
}

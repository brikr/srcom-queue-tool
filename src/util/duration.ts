import { parse } from "tinyduration";

export function formatDuration(isoDuration: string): string {
  const parsedTime = parse(isoDuration);

  const parsedHours = parsedTime.hours || 0;
  const parsedMinutes = parsedTime.minutes || 0;
  const parsedSeconds = parsedTime.seconds || 0;

  const hours = parsedHours ? `${parsedHours}:` : "";

  let minutes = `${parsedMinutes}:`;
  if (parsedHours && parsedMinutes < 10) {
    minutes = `0${minutes}`;
  }

  let seconds = `${parsedSeconds}`;
  if (parsedSeconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${hours}${minutes}${seconds}`;
}

const SECONDS_MS = 1000;
const MINUTES_MS = SECONDS_MS * 60;
const HOURS_MS = MINUTES_MS * 60;
const DAYS_MS = HOURS_MS * 24;

export function durationToMillis(isoDuration: string): number {
  const parsedTime = parse(isoDuration);

  const daysMs = parsedTime.days ? parsedTime.days * DAYS_MS : 0;
  const hoursMs = parsedTime.hours ? parsedTime.hours * HOURS_MS : 0;
  const minutesMs = parsedTime.minutes ? parsedTime.minutes * MINUTES_MS : 0;
  const secondsMs = parsedTime.seconds ? parsedTime.seconds * SECONDS_MS : 0;

  return daysMs + hoursMs + minutesMs + secondsMs;
}

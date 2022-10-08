import { parse } from "tinyduration";

export function formatDuration(isoDuration: string): string {
  const parsedTime = parse(isoDuration);

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

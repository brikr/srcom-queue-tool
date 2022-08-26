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

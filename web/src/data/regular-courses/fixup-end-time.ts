import { stdin } from "node:process";
import { strictEqual } from "node:assert/strict";

import papa from "papaparse";
import { lightFormat, parse } from "date-fns";

const NOW = new Date();
function convertTimeToMinutes(timeStr: string) {
  const trimmedTime = timeStr.trim();

  // Parse the time using date-fns with a reference date
  // We use a reference date to ensure consistent parsing
  const parsedDate = parse(trimmedTime, "h:mm a", NOW);

  // Extract hours and minutes from the parsed date
  const hours = parsedDate.getHours();
  const minutes = parsedDate.getMinutes();

  if (hours === 0 && minutes === 0) return trimmedTime;

  parsedDate.setMinutes(minutes + 1);
  return lightFormat(parsedDate, "h:mm a");
}

const { promise, resolve, reject } = Promise.withResolvers<papa.ParseResult<unknown>>();
papa.parse(stdin, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  transform: (value, field) => {
    switch (field) {
      case "stop_time":
        return convertTimeToMinutes(value);
      default:
        return value;
    }
  },
  error: e => reject(e),
  complete: results => resolve(results),
});

const { errors, data } = await promise;
strictEqual(errors.length, 0);

console.log(papa.unparse(data, { header: true }));

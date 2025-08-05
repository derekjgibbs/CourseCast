export class UnknownDayCodeError extends Error {
  constructor(public daysCode: string) {
    super(`unknown days code: ${daysCode}`);
    this.name = "UnknownDayCodeError";
  }
}

export function getDayCodeSortIndex(daysCode: string) {
  switch (daysCode) {
    case "M":
      return 0;
    case "MW":
      return 1;
    case "T":
      return 2;
    case "TR":
      return 3;
    case "W":
      return 4;
    case "R":
      return 5;
    case "F":
      return 6;
    case "FS":
      return 7;
    case "S":
      return 8;
    case "U":
      return 9;
    case "TBA":
      return 10;
    default:
      throw new UnknownDayCodeError(daysCode);
  }
}

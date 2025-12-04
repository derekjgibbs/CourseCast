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

export class UnknownQuarterError extends Error {
  constructor(public quarter: string) {
    super(`unknown quarter: ${quarter}`);
    this.name = "UnknownQuarterError";
  }
}

export function getQuarterSortIndex(quarter: string) {
  switch (quarter) {
    case "Q1":
      return 0;
    case "Q2":
      return 1;
    case "Q3":
      return 2;
    case "Q4":
      return 3;
    case "F":
      return 4;
    case "S":
      return 5;
    case "Full":
      return 6;
    case "Modular":
      return 7;
    case "TBA":
      return 8;
    default:
      throw new UnknownQuarterError(quarter);
  }
}

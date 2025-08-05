export function getTermCodes(partOfTerm: string) {
  switch (partOfTerm) {
    case "Q1":
      return ["Q1"];
    case "Q2":
      return ["Q2"];
    case "Q3":
      return ["Q3"];
    case "Q4":
      return ["Q4"];
    case "F":
      return ["Q1", "Q2"];
    case "S":
      return ["Q3", "Q4"];
    case "Full":
      return ["Q1", "Q2", "Q3", "Q4"];
    case "Modular":
      return ["Modular"];
    case "TBA":
      return ["TBA"];
    default:
      throw new Error(`unknown part of term: ${partOfTerm}`);
  }
}

export function getDayCodes(daysCode: string) {
  switch (daysCode) {
    case "M":
      return ["M"];
    case "T":
      return ["T"];
    case "W":
      return ["W"];
    case "R":
      return ["R"];
    case "F":
      return ["F"];
    case "S":
      return ["S"];
    case "U":
      return ["U"];
    case "MW":
      return ["M", "W"];
    case "TR":
      return ["T", "R"];
    case "FS":
      return ["F", "S"];
    case "TBA":
      return ["TBA"];
    default:
      throw new Error(`unknown days code: ${daysCode}`);
  }
}

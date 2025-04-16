import { v5 as uuidv5 } from "uuid";

const NAMESPACE = uuidv5.DNS;

export function idOf(arg: string): string {
  return uuidv5(arg, NAMESPACE);
}

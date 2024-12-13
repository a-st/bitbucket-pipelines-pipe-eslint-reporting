import { createHash } from "crypto";

export function generateMd5Key(context: string): string {
  return createHash("md5")
    .update(context)
    .digest("hex");
}

export function isDebug(): boolean {
  return process.env.DEBUG == "true" || false;
}

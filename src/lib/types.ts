export type Edition = "bedrock" | "java";
export type FitMode = "fill" | "fit";

export type BedrockVersion =
  | "1.20+"
  | "1.18-1.19"
  | "1.16-1.17"
  | "1.13-1.15"
  | "legacy";

export type JavaVersion = "1.21+" | "1.20" | "1.19" | "1.13-1.18" | "1.7-1.12";

export type LogType = "ok" | "warn" | "err" | "info" | "active";

export interface LogLine {
  id: number;
  msg: string;
  type: LogType;
}

export interface BuildOptions {
  edition: Edition;
  bedrockVersion: BedrockVersion;
  javaVersion: JavaVersion;
  packName: string;
  packDesc: string;
  fill: boolean;
  bgDataUrl: string;
  iconDataUrl: string | null;
}

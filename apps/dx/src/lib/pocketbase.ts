import PocketBase from "pocketbase";

const url = process.env.NEXT_PUBLIC_PB_URL ?? "http://127.0.0.1:8091";

// One browser-side PocketBase client. Never put superuser credentials here.
export const pb = new PocketBase(url);
pb.autoCancellation(false);

export const gitEngineUrl =
  process.env.NEXT_PUBLIC_GIT_ENGINE_URL ?? "http://127.0.0.1:3200";

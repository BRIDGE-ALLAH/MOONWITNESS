import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "./config";
import { getAdmin, type AuthUser } from "./pocketbase";
import { createRepositorySchema } from "@local-git/contracts";

const execFileAsync = promisify(execFile);

export async function listRepositories(user: AuthUser) {
  const admin = await getAdmin();
  const items = await admin.collection("repositories").getFullList({
    filter: `owner = "${user.id}"`,
    sort: "-created",
  });
  return items.map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    slug: repo.slug,
    path: repo.path,
    description: repo.description ?? "",
    visibility: repo.visibility,
    default_branch: repo.default_branch || "main",
    created: repo.created,
    clone_url: `${config.publicGitBaseUrl}/git/${repo.path}.git`,
  }));
}

export async function createRepository(user: AuthUser, input: unknown) {
  const parsed = createRepositorySchema.safeParse(input);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues.map((issue) => issue.message).join(" "));
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  const data = parsed.data;
  const path = `${user.username}/${data.slug}`;
  const admin = await getAdmin();
  const duplicates = await admin.collection("repositories").getList(1, 1, { filter: `path = "${path}"` });
  if (duplicates.totalItems > 0) {
    const error = new Error("A repository with this path already exists.");
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const record = await admin.collection("repositories").create({
    owner: user.id,
    name: data.name,
    slug: data.slug,
    path,
    description: data.description,
    visibility: data.visibility,
    default_branch: "main",
    storage_key: "pending",
  });

  const repositoryPath = join(config.dataDir, `${record.id}.git`);
  try {
    await mkdir(config.dataDir, { recursive: true });
    await execFileAsync("git", ["init", "--bare", "--initial-branch=main", repositoryPath], { timeout: 30_000 });
    await execFileAsync("git", ["--git-dir", repositoryPath, "config", "http.receivepack", "true"], { timeout: 10_000 });
    await execFileAsync("git", ["--git-dir", repositoryPath, "config", "http.uploadpack", "true"], { timeout: 10_000 });
    await execFileAsync("git", ["--git-dir", repositoryPath, "config", "gc.auto", "0"], { timeout: 10_000 });
    await admin.collection("repositories").update(record.id, { storage_key: record.id });
  } catch (error) {
    try { await rm(repositoryPath, { recursive: true, force: true }); } catch { /* operator can reconcile the orphan */ }
    try { await admin.collection("repositories").delete(record.id); } catch { /* operator can reconcile the metadata record */ }
    throw error;
  }

  return {
    id: record.id,
    name: data.name,
    slug: data.slug,
    path,
    description: data.description,
    visibility: data.visibility,
    default_branch: "main",
    created: record.created,
    clone_url: `${config.publicGitBaseUrl}/git/${path}.git`,
  };
}

export async function findRepository(ownerUsername: string, slug: string) {
  const admin = await getAdmin();
  try {
    const path = `${ownerUsername}/${slug}`;
    return await admin.collection("repositories").getFirstListItem(`path = "${path}"`);
  } catch { return null; }
}

/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // users collection is auto-created by PocketBase; patch rules only
  let usersCollection;
  try {
    usersCollection = app.findCollectionByNameOrId("users");
  } catch (e) {
    // create if somehow missing (shouldn't happen on v0.41+)
    usersCollection = new Collection({ type: "auth", name: "users" });
  }
  usersCollection.listRule = "id = @request.auth.id";
  usersCollection.viewRule = "id = @request.auth.id";
  usersCollection.createRule = "";
  usersCollection.updateRule = "id = @request.auth.id";
  usersCollection.deleteRule = "id = @request.auth.id";
  app.save(usersCollection);

  const repositories = new Collection({
    type: "base",
    name: "repositories",
    fields: [
      { type: "relation", name: "owner", required: true, collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "name", required: true, max: 80 },
      { type: "text", name: "slug", required: true, max: 48 },
      { type: "text", name: "path", required: true, max: 100 },
      { type: "text", name: "description", max: 280 },
      { type: "select", name: "visibility", required: true, maxSelect: 1, values: ["private", "public"] },
      { type: "text", name: "default_branch", required: true, max: 100 },
      { type: "text", name: "storage_key", required: true, max: 64 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_repositories_path ON repositories (path COLLATE NOCASE)",
      "CREATE INDEX idx_repositories_owner ON repositories (owner)",
    ],
    listRule: "owner = @request.auth.id || visibility = \"public\"",
    viewRule: "owner = @request.auth.id || visibility = \"public\"",
    createRule: "@request.auth.id != \"\" && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
  });
  app.save(repositories);
  const repositoriesCollection = app.findCollectionByNameOrId("repositories");

  const tokens = new Collection({
    type: "base",
    name: "personal_access_tokens",
    fields: [
      { type: "relation", name: "owner", required: true, collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "name", required: true, max: 80 },
      { type: "text", name: "token_hash", required: true, max: 64 },
      { type: "text", name: "token_prefix", required: true, max: 16 },
      { type: "json", name: "scopes", required: true, maxSize: 2048 },
      { type: "date", name: "expires_at" },
      { type: "bool", name: "revoked" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_pat_token_hash ON personal_access_tokens (token_hash)",
      "CREATE INDEX idx_pat_owner ON personal_access_tokens (owner)",
    ],
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
  });
  app.save(tokens);

  const collaborators = new Collection({
    type: "base",
    name: "collaborators",
    fields: [
      { type: "relation", name: "repository", required: true, collectionId: repositoriesCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "relation", name: "user", required: true, collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "select", name: "role", required: true, maxSelect: 1, values: ["read", "write", "admin"] },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_collaborators_repo_user ON collaborators (repository, user)"],
    listRule: "user = @request.auth.id",
    viewRule: "user = @request.auth.id",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  app.save(collaborators);

  const activities = new Collection({
    type: "base",
    name: "activities",
    fields: [
      { type: "relation", name: "actor", required: true, collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "relation", name: "repository", collectionId: repositoriesCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "action", required: true, max: 80 },
      { type: "json", name: "payload", maxSize: 4096 },
    ],
    indexes: ["CREATE INDEX idx_activities_actor ON activities (actor)"],
    listRule: "actor = @request.auth.id",
    viewRule: "actor = @request.auth.id",
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });
  app.save(activities);

  const organizations = new Collection({
    type: "base",
    name: "organizations",
    fields: [
      { type: "relation", name: "owner", required: true, collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: true },
      { type: "text", name: "name", required: true, max: 100 },
      { type: "text", name: "slug", required: true, max: 48 },
      { type: "text", name: "description", max: 280 },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_organizations_slug ON organizations (slug COLLATE NOCASE)"],
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != \"\" && owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
  });
  app.save(organizations);
}, (app) => {
  const names = ["organizations", "activities", "collaborators", "personal_access_tokens", "repositories", "users"];
  for (const name of names) {
    try { app.delete(app.findCollectionByNameOrId(name)); } catch (e) { /* already removed */ }
  }
});

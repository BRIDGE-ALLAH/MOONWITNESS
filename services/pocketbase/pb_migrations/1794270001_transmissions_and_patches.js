/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");

  const transmissions = new Collection({
    type: "base",
    name: "transmissions",
    fields: [
      { type: "text", name: "author", required: true, max: 80 },
      { type: "text", name: "text", required: true, max: 500 },
      { type: "text", name: "coordinates", max: 100 },
      { type: "text", name: "timestamp", max: 40 },
      { type: "relation", name: "user", collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: false },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: null,
    deleteRule: "@request.auth.id != \"\" && user = @request.auth.id",
  });
  app.save(transmissions);

  const patches = new Collection({
    type: "base",
    name: "soul_patches",
    fields: [
      { type: "text", name: "title", required: true, max: 80 },
      { type: "text", name: "chord", required: true, max: 80 },
      { type: "text", name: "motto", required: true, max: 200 },
      { type: "text", name: "variant", required: true, max: 20 },
      { type: "text", name: "status", required: true, max: 20 },
      { type: "relation", name: "owner", collectionId: usersCollection.id, maxSelect: 1, cascadeDelete: false },
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: null,
    deleteRule: "@request.auth.id != \"\" && owner = @request.auth.id",
  });
  app.save(patches);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("soul_patches")); } catch (e) {}
  try { app.delete(app.findCollectionByNameOrId("transmissions")); } catch (e) {}
});

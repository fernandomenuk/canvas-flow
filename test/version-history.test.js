import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { captureVersion, restoreArtifactVersion, versionFilePath } from "../src/server.js";
import { SessionStore } from "../src/session-store.js";

// versionsDir() (and thus versionFilePath) resolve against CANVAS_FLOW_STATE_DIR, so each test points
// it at its own temp dir and restores the prior value afterward.
async function withSession(run) {
  const dir = await mkdtemp(path.join(tmpdir(), "canvasflow-version-"));
  const previousStateDir = process.env.CANVAS_FLOW_STATE_DIR;
  process.env.CANVAS_FLOW_STATE_DIR = dir;
  try {
    const artifact = path.join(dir, "artifact.html");
    await writeFile(artifact, "<h1>v1</h1>");
    const store = new SessionStore(path.join(dir, "state.json"));
    const session = await store.upsertSession(artifact, "http://localhost:4387/session/test");
    await run({ store, session, artifact });
  } finally {
    if (previousStateDir === undefined) delete process.env.CANVAS_FLOW_STATE_DIR;
    else process.env.CANVAS_FLOW_STATE_DIR = previousStateDir;
    await rm(dir, { recursive: true, force: true });
  }
}

test("saving a version records metadata and stores the exact bytes on disk", async () => {
  await withSession(async ({ store, session }) => {
    const entry = await captureVersion(store, session, session.key);
    assert.equal(entry.n, 1);
    assert.notEqual(entry.deduped, true);

    const versions = await store.listVersions(session.key);
    assert.equal(versions.length, 1);
    assert.deepEqual(await store.getVersion(session.key, 1), versions[0]);
    assert.equal(await readFile(versionFilePath(session.key, 1), "utf8"), "<h1>v1</h1>");
  });
});

test("saving identical content again dedupes instead of adding a version", async () => {
  await withSession(async ({ store, session }) => {
    await captureVersion(store, session, session.key);
    const again = await captureVersion(store, session, session.key);

    assert.equal(again.deduped, true);
    assert.equal(again.n, 1);
    assert.equal((await store.listVersions(session.key)).length, 1);
  });
});

test("restore writes the chosen version back and checkpoints the current content first", async () => {
  await withSession(async ({ store, session, artifact }) => {
    await captureVersion(store, session, session.key); // version 1 = "<h1>v1</h1>"
    await writeFile(artifact, "<h1>v2</h1>");

    const result = await restoreArtifactVersion(store, session, session.key, 1);
    assert.deepEqual(result, { restored: 1 });

    // The artifact file is back to version 1's content...
    assert.equal(await readFile(artifact, "utf8"), "<h1>v1</h1>");
    // ...and the pre-restore state was preserved as a new checkpoint (non-destructive / undo).
    const versions = await store.listVersions(session.key);
    assert.equal(versions.length, 2);
    assert.equal(await readFile(versionFilePath(session.key, 2), "utf8"), "<h1>v2</h1>");
  });
});

test("restoring a version that does not exist returns null", async () => {
  await withSession(async ({ store, session }) => {
    assert.equal(await restoreArtifactVersion(store, session, session.key, 99), null);
  });
});

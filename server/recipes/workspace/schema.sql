-- Recipe workspace v1. Apply only to an explicitly approved isolated database.
-- No existing file recipes are imported. No public/contributor role has privileges.
CREATE TABLE recipe_records (
 id text PRIMARY KEY CHECK(id ~ '^[a-z][a-z0-9-]*:[a-z0-9-]+$'),
 origin text NOT NULL CHECK(origin IN ('ezeats-owned','licensed-provider','user-submitted')),
 provider text,
 submitting_account_id text NOT NULL,
 latest_version integer NOT NULL CHECK(latest_version>0),
 latest_status text NOT NULL CHECK(latest_status IN ('draft','pending','approved','published','changes-requested','rejected')),
 published_version integer,
 lock_version integer NOT NULL CHECK(lock_version>0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 removed_at timestamptz,
 removed_by text
);
CREATE TABLE recipe_revisions (
 recipe_id text NOT NULL REFERENCES recipe_records(id),
 version integer NOT NULL CHECK(version>0),
 parent_version integer,
 document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
 content_fingerprint text NOT NULL,
 created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(recipe_id,version),
 FOREIGN KEY(recipe_id,parent_version) REFERENCES recipe_revisions(recipe_id,version)
);
ALTER TABLE recipe_records ADD CONSTRAINT recipe_latest_fk FOREIGN KEY(id,latest_version) REFERENCES recipe_revisions(recipe_id,version) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE recipe_records ADD CONSTRAINT recipe_published_fk FOREIGN KEY(id,published_version) REFERENCES recipe_revisions(recipe_id,version) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE recipe_moderation_events (
 event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 recipe_id text NOT NULL,
 version integer NOT NULL,
 action text NOT NULL CHECK(action IN ('create','save','submit','approve','publish','approve-and-publish','request-changes','reject','remove')),
 status text NOT NULL CHECK(status IN ('draft','pending','approved','published','changes-requested','rejected','removed')),
 actor_account_id text NOT NULL,
 private_notes text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(recipe_id,version) REFERENCES recipe_revisions(recipe_id,version)
);
CREATE INDEX recipe_queue ON recipe_records(latest_status,updated_at DESC,id);
CREATE INDEX recipe_fingerprints ON recipe_revisions(content_fingerprint);
CREATE INDEX recipe_events ON recipe_moderation_events(recipe_id,event_id);
-- Bounded one-row-per-owner counter, shared across serverless instances.
CREATE TABLE recipe_owner_limits (actor text PRIMARY KEY, window_start timestamptz NOT NULL, operations integer NOT NULL);
CREATE FUNCTION recipe_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Recipe revisions and moderation events are append-only'; END;
$$;
CREATE TRIGGER immutable_recipe_revision BEFORE UPDATE OR DELETE ON recipe_revisions FOR EACH ROW EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER immutable_recipe_event BEFORE UPDATE OR DELETE ON recipe_moderation_events FOR EACH ROW EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER no_truncate_recipe_revision BEFORE TRUNCATE ON recipe_revisions FOR EACH STATEMENT EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER no_truncate_recipe_event BEFORE TRUNCATE ON recipe_moderation_events FOR EACH STATEMENT EXECUTE FUNCTION recipe_immutable();
REVOKE ALL ON recipe_records,recipe_revisions,recipe_moderation_events,recipe_owner_limits FROM PUBLIC;
REVOKE ALL ON SEQUENCE recipe_moderation_events_event_id_seq FROM PUBLIC;
-- Reports, invitations, uploads and public submission tables/routes are not activated.
-- Preview operator: grant only SELECT/INSERT on revisions/events and SELECT/INSERT/UPDATE
-- on records/limits to a dedicated runtime role, plus sequence USAGE. Never use an owner role.

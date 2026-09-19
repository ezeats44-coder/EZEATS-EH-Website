-- DESIGN MIGRATION ONLY. Not applied; no recipe collection enabled.
-- SUPERSEDED: do not apply this historical design. The reviewed workspace migration
-- is ../workspace/schema.sql; it separates immutable content from append-only decisions.
-- Payload is Recipe v1 JSON. Licensed content may be stored only with explicit rights.
CREATE TABLE recipe_records (
 id text PRIMARY KEY CHECK (id ~ '^[a-z][a-z0-9-]*:[a-z0-9-]+$'),
 origin text NOT NULL CHECK (origin IN ('ezeats-owned','licensed-provider','user-submitted')),
 provider text,
 submitting_account_id text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 published_version integer,
 lock_version integer NOT NULL DEFAULT 0,
 removed_at timestamptz,
 removed_by text
);
CREATE TABLE recipe_revisions (
 recipe_id text NOT NULL REFERENCES recipe_records(id),
 version integer NOT NULL CHECK (version>0),
 parent_version integer,
 status text NOT NULL CHECK (status IN ('draft','pending','changes-requested','approved','rejected','published')),
 payload jsonb NOT NULL,
 original_author jsonb NOT NULL,
 public_attribution text NOT NULL,
 source_url text,
 copyright_attestation jsonb NOT NULL,
 image_rights jsonb NOT NULL,
 suitability_evidence jsonb NOT NULL,
 content_fingerprint text NOT NULL,
 submitting_account_id text,
 submitted_at timestamptz,
 reviewed_at timestamptz,
 approved_at timestamptz,
 published_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewing_administrator text,
 PRIMARY KEY(recipe_id,version),
 FOREIGN KEY(recipe_id,parent_version) REFERENCES recipe_revisions(recipe_id,version)
);
ALTER TABLE recipe_records ADD CONSTRAINT recipe_public_revision_fk
 FOREIGN KEY(id,published_version) REFERENCES recipe_revisions(recipe_id,version);
CREATE INDEX recipe_revision_queue ON recipe_revisions(status,submitted_at);
CREATE INDEX recipe_duplicate_candidates ON recipe_revisions(content_fingerprint);
CREATE TABLE recipe_moderation_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipe_id text NOT NULL,
 version integer NOT NULL,
 actor_account_id text NOT NULL,
 action text NOT NULL,
 private_notes text,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(recipe_id,version) REFERENCES recipe_revisions(recipe_id,version)
);
CREATE TABLE recipe_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 recipe_id text NOT NULL,
 version integer NOT NULL,
 reporting_account_id text,
 reason text NOT NULL,
 private_details text,
 status text NOT NULL CHECK(status IN ('pending','reviewed','dismissed','actioned')),
 reviewing_administrator text,
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(recipe_id,version) REFERENCES recipe_revisions(recipe_id,version)
);
-- Future adapter must revoke direct client access, enforce immutable revision payloads,
-- and atomically CAS lock_version + append revision/event + move publication pointer.
-- No public query may return submitting IDs, attestations, reports or private notes.

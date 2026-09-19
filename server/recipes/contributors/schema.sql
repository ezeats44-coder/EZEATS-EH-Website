-- contributor-beta-v1: additive to owner-recipe-workspace-v1; never auto-run.
CREATE TABLE recipe_invitations (
 account_id text PRIMARY KEY, invited_by text NOT NULL, invited_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL, revoked_at timestamptz, revoked_by text,
 CHECK(expires_at>invited_at)
);
CREATE TABLE recipe_invitation_events (
 event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 account_id text NOT NULL, actor_id text NOT NULL,
 action text NOT NULL CHECK(action IN ('invite','revoke','account-deleted')),
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz
);
CREATE TABLE recipe_contributor_limits (
 actor text NOT NULL, category text NOT NULL, window_start timestamptz NOT NULL,
 operations integer NOT NULL, PRIMARY KEY(actor,category)
);
CREATE TABLE recipe_contributor_requests (
 actor text NOT NULL, request_id uuid NOT NULL, fingerprint text NOT NULL,
 recipe_id text NOT NULL REFERENCES recipe_records(id), created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(actor,request_id)
);
CREATE TABLE recipe_change_requests (
 event_id bigint PRIMARY KEY REFERENCES recipe_moderation_events(event_id),
 recipe_id text NOT NULL REFERENCES recipe_records(id), version integer NOT NULL,
 message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(recipe_id,version) REFERENCES recipe_revisions(recipe_id,version)
);
CREATE INDEX recipe_contributor_owned ON recipe_records(submitting_account_id,updated_at DESC,id);
CREATE INDEX recipe_change_request_lookup ON recipe_change_requests(recipe_id,event_id);
CREATE TRIGGER immutable_invitation_events BEFORE UPDATE OR DELETE ON recipe_invitation_events FOR EACH ROW EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER no_truncate_invitation_events BEFORE TRUNCATE ON recipe_invitation_events FOR EACH STATEMENT EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER immutable_change_requests BEFORE UPDATE OR DELETE ON recipe_change_requests FOR EACH ROW EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER no_truncate_change_requests BEFORE TRUNCATE ON recipe_change_requests FOR EACH STATEMENT EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER immutable_contributor_requests BEFORE UPDATE OR DELETE ON recipe_contributor_requests FOR EACH ROW EXECUTE FUNCTION recipe_immutable();
CREATE TRIGGER no_truncate_contributor_requests BEFORE TRUNCATE ON recipe_contributor_requests FOR EACH STATEMENT EXECUTE FUNCTION recipe_immutable();
REVOKE ALL ON recipe_invitations,recipe_invitation_events,recipe_contributor_limits,recipe_contributor_requests,recipe_change_requests FROM PUBLIC;
REVOKE ALL ON SEQUENCE recipe_invitation_events_event_id_seq FROM PUBLIC;

-- 20261113_feedback_v1: additive, no existing tables changed.
CREATE TABLE feedback_conversations (
 id uuid PRIMARY KEY, account_id text NOT NULL, category text NOT NULL CHECK(category IN ('Suggestion','Bug or problem','Question','Concern','Other')),
 subject text NOT NULL CHECK(length(subject) BETWEEN 1 AND 120), status text NOT NULL DEFAULT 'New' CHECK(status IN ('New','Reviewing','Planned','Resolved','Closed')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 last_user_message_at timestamptz, last_owner_message_at timestamptz,
 user_read integer NOT NULL DEFAULT 0 CHECK(user_read>=0), owner_read integer NOT NULL DEFAULT 0 CHECK(owner_read>=0), sequence integer NOT NULL DEFAULT 0 CHECK(sequence>=0),
 version integer NOT NULL DEFAULT 1 CHECK(version>0), archived boolean NOT NULL DEFAULT false
);
CREATE INDEX feedback_account_updated ON feedback_conversations(account_id,updated_at DESC,id);
CREATE INDEX feedback_owner_updated ON feedback_conversations(status,category,updated_at DESC,id);
CREATE TABLE feedback_messages (
 id uuid PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES feedback_conversations(id), sequence integer NOT NULL CHECK(sequence>0),
 sender_type text NOT NULL CHECK(sender_type IN ('user','owner')), sender_id text NOT NULL,
 body text NOT NULL CHECK(length(body) BETWEEN 1 AND 4000), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(conversation_id,sequence)
);
CREATE TABLE feedback_requests (account_id text NOT NULL, request_id uuid NOT NULL, digest text NOT NULL, conversation_id uuid NOT NULL REFERENCES feedback_conversations(id), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(account_id,request_id));
CREATE TABLE feedback_limits (account_id text NOT NULL, window_start timestamptz NOT NULL, attempts integer NOT NULL CHECK(attempts>0), PRIMARY KEY(account_id,window_start));
CREATE TABLE feedback_events (id uuid PRIMARY KEY, conversation_id uuid NOT NULL REFERENCES feedback_conversations(id), actor_id text NOT NULL, action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

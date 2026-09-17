CREATE TABLE IF NOT EXISTS ezeats_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 submission_id text UNIQUE NOT NULL,
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 40),
 comment text NOT NULL CHECK (length(comment) BETWEEN 10 AND 2000),
 rating integer CHECK (rating BETWEEN 1 AND 5),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 moderated_at timestamptz,
 moderated_by text
);
CREATE INDEX IF NOT EXISTS ezeats_reviews_status_date ON ezeats_reviews(status,created_at DESC);
CREATE TABLE IF NOT EXISTS ezeats_review_limits (
 key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE OR REPLACE FUNCTION ezeats_submit_review(sid text, author text, body text, stars integer, bucket text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE attempts integer;
BEGIN
 PERFORM pg_advisory_xact_lock(734829105);
 IF EXISTS(SELECT 1 FROM ezeats_reviews WHERE submission_id=sid) THEN RETURN; END IF;
 DELETE FROM ezeats_review_limits WHERE expires_at < now();
 INSERT INTO ezeats_review_limits VALUES(bucket,1,now()+interval '1 day')
 ON CONFLICT(key) DO UPDATE SET count=ezeats_review_limits.count+1 RETURNING count INTO attempts;
 IF attempts>5 OR (SELECT count(*) FROM ezeats_reviews WHERE status='pending')>=2000 THEN
  RAISE EXCEPTION 'REVIEW_LIMIT';
 END IF;
 INSERT INTO ezeats_reviews(submission_id,name,comment,rating) VALUES(sid,author,body,stars);
END $$;

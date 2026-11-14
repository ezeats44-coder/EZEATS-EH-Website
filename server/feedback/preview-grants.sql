-- Preview project royal-fire-77229787 ONLY. Run after schema.sql in its migration transaction.
-- No ownership, schema CREATE, DELETE, public grants, or production permissions.
GRANT SELECT,INSERT,UPDATE ON feedback_conversations,feedback_limits TO ezeats_recipe_runtime;
GRANT SELECT,INSERT ON feedback_messages,feedback_requests,feedback_events TO ezeats_recipe_runtime;

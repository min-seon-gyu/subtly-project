ALTER TABLE subscriptions
    ADD COLUMN is_free_trial BOOLEAN NOT NULL DEFAULT FALSE AFTER currency;

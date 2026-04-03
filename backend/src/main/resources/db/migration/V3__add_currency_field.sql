ALTER TABLE subscriptions
    ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'KRW' AFTER payment_method;

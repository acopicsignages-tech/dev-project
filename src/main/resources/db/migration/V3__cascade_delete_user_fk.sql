-- V3: Ensure ON DELETE CASCADE on foreign keys referencing users table
ALTER TABLE user_sessions 
    DROP CONSTRAINT IF EXISTS fk8klxsgb8dcjjklmqebqp1twd5,
    DROP CONSTRAINT IF EXISTS fk_user_sessions_user,
    ADD CONSTRAINT fk_user_sessions_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE downloads 
    DROP CONSTRAINT IF EXISTS fkjb9vjhmpns24p7vuyjcc0wa5l,
    DROP CONSTRAINT IF EXISTS fk_downloads_user,
    ADD CONSTRAINT fk_downloads_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

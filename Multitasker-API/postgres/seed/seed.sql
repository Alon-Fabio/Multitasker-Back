-- Admin:
BEGIN;

-- INSERT INTO users (user_type, name, email, joined) values ('admin', 'name', 'mail', NOW());

-- INSERT INTO login (hash, email) values ('hashed password', 'mail');

-- Demo user:
INSERT INTO users (user_type, name, email, joined) values ('demo', 'Demo', 'demo@alonfabio.com', NOW());

INSERT INTO login (hash, email) values ('$2a$10$LPjSKGaA.6C7oYgeAVu4K.HGoGwRTwJrOvnRzBGg8gPaPwEML8rKO', 'demo@alonfabio.com');

COMMIT;
BEGIN TRANSACTION;

CREATE TABLE users (
    id serial PRIMARY KEY,
    user_type VARCHAR(100),
    name VARCHAR(100),
    email TEXT UNIQUE NOT NULL,
    pet VARCHAR(100),
    age VARCHAR(100),
    entries BIGINT DEFAULT 0,
    joined TIMESTAMP NOT NULL
);

COMMIT;
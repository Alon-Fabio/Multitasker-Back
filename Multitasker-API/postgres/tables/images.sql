BEGIN TRANSACTION;

CREATE TABLE images (
    id serial PRIMARY KEY,
    folder varchar(30) NOT NULL,
    img_format varchar(8) NOT NULL,
    name varchar(2083) NOT NULL, --max length that is acceptable in browsers.
    width smallint,
    height smallint,
    version varchar(30) NOT NULL,
    created_at varchar(30) NOT NULL
);

COMMIT;

# Multitasker-Back

> Note: This is a copy of a the Multitasker application's working server.

This server handles all the needs of the Multitasker application, which includes:

1. User handling (& admin users).
2. User authentication & keeping user session.
3. Data handling (with Postgres, Redis).
4. Calls to other services (AWS lambda, Clarifai).
5. SSL encryption & auto certificate renewal (letsencrypt, certbot).
6. Health checks.

## Run in Dev mode:

> Note: Make sure your machine has docker installed.

If you're starting from scratch, I'll need to:

1. Edit file nginx\nginx.conf:
   1. Comment-out Production & comment-in for dev.
   2. Add your domain (replace this 'add.your.domain.here' in the file).
2. Go in to Multitasker-API, run `mpn i`.
3. Run `docker compose up --build nginx`. You'll have to stop it manually when it reaches ' 1#1: start worker process' (If you don't care to see terminal logs, you can skip to 5'th step).
4. Run `docker compose down`, down all containers.
5. Run `docker compose up`, now all the containers need to run.

## Production setup:

> Note: You'll need a working domain you're in control of.

**See file structure:**

```fs
Multitasker-Back
|
|-- backend.env
|
|-- nginx
| |-- nginx.conf
|
|-- Multitasker-API
| |-- nginx.Dockerfile
| |-- dockerfile
| |-- secret.js
|
|-- docker-compose.yaml
|-- docker-compose-le.yam
```

### SSL setup:

1. Go trough Run in Dev mode steps 1-4.
2. Edit docker-compose-le.yam; edit the 'command' line to fit your needs (you'll need to replace the domain name & email).
3. Run `docker compose -f docker-compose-le.yaml up --build`.
4. Edit file nginx\nginx.conf. See comment-out/in for for production.
5. Run `docker compose down` & `docker compose up --build -d nginx`.

##### The next steps are for auto certificate renewal.

6. Run `docker compose -f <absolute path to folder>/docker-compose-le.yaml up` to rerun th certbot/letsencrypt container.
7. Run `docker exec -it nginx-service nginx -s reload`.

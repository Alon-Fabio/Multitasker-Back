# <a name="Server-Dev" >Server-Dev </a>

> Credit/follow the guid from [leangaurav](https://leangaurav.medium.com/) [Simplest HTTPS setup: Nginx Reverse Proxy+ LetsEncrypt + AWS Cloud + Docker](https://leangaurav.medium.com/simplest-https-setup-nginx-reverse-proxy-letsencrypt-ssl-certificate-aws-cloud-docker-4b74569b3c61).

## Mind the differences

> by order of appearance in the guid.

- <h3> Project structure: </h3> i've change the naming of the folders to match my project.

- <h3> nginx.Dockerfile: </h3> By some reason the default.conf file was not overwritten or deleted. So instead of the nginx.conf file, I've overwritten it.

- <h3> docker-compose.yml: </h3>

  - **Nginx ports:** Make sure nginx is running on it's own uniq ports (preferably 80, 8080, 443). I hed a problem with port upgrading in my chrome browser. Chrome woden't upgrade me to https and I needed to be on http. localhost:80 aka http://localhost, but it can be reached on 172.0.0.1. (Works fine of firefox)

  - **network:** Make sure the nginx server is on the same network as the backend (express app).

- <h3> nginx.conf file: <h3> I've made major changes to this file to make it load my node container. There're a lot of nginx rules to keep in mind.

  - upstream: This is where you define the connection to your backend.

    Server.

    ```nginx
    upstream serverName {
        server containerName:port;
    }
    ```

    The `serverName` is a reference to be used in the `nginx.conf` file. the `containerName` is the name of the docker container with his open port

    The port need only be exposed to nginx, this means, ports in the docker container need to be reachable inside the docker, you don't need to, and recommended not to expose them.

  - http: server_name: I've spent some time thinking it's more then just a reference, but I think it's not essential to make this work.

  - location /static/: Nginx will try to serve the static file which give a blank white page. (Boy did this one trick me..)

- <h3> .dockerignore: </h3> I was getting an error for the postgres folder, adding it to the list solved the issue.

- Note: To render any changes to `nginx.cong`, run `docker-compose up nginx --build`.

Run with `docker-compose up`

# Dev mode:

### Nginx setup:

If you do need SSL, see guide at the [top](#Server-Dev) to get it running. This is for running locally.

For easy dev see `nginx.conf`. you'll need to comment-out and comment-in some code. Fore more detail, continue reading.

If you're starting from scratch, I'll need to:

1. nginx\nginx.conf: Comment out the 443 SSL server, replace 'return 301 https://$host$request_uri' with 'proxy_pass http://api;' to location /. This is how you connect you backend to the nginx server.
2. Go in to Multitasker-API, run mpn i.
3. Run 'docker-compose up --build nginx'. You'll have to stop it manually when it reaches ' 1#1: start worker process'.
4. Run 'docker-compose down', down all containers. <!-- Skip to 3 if there's no need to see the terminal  -->
5. Run 'docker-compose up', now all the containers need to run.

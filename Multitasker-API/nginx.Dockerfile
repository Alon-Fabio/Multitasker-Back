FROM nginx:1.21.1-alpine
RUN rm /etc/nginx/conf.d/default.conf
# COPY /nginx/nginx.conf /etc/nginx/conf.d
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf

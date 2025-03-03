FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /inicio.html; \
    } \
    location /components/ { \
        alias /usr/share/nginx/html/components/; \
    } \
    location /assets/ { \
        alias /usr/share/nginx/html/assets/; \
    } \
    location /img/ { \
        alias /usr/share/nginx/html/img/; \
    } \
    location /js/ { \
        alias /usr/share/nginx/html/js/; \
    } \
    location /pages/ { \
        alias /usr/share/nginx/html/pages/; \
    } \
}' > /etc/nginx/conf.d/nginx.conf

COPY . /usr/share/nginx/html


EXPOSE 3301

CMD ["nginx", "-g", "daemon off;"]
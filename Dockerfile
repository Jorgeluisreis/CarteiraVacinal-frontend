FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index inicio.html; \
    try_files $uri $uri/ /inicio.html; \
    location /assets/ { alias /usr/share/nginx/html/assets/; } \
    location /components/ { alias /usr/share/nginx/html/components/; } \
    location /img/ { alias /usr/share/nginx/html/img/; } \
    location /js/ { alias /usr/share/nginx/html/js/; } \
    location /pages/ { alias /usr/share/nginx/html/pages/; } \
}' > /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
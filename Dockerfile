FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 3301

CMD ["nginx", "-g", "daemon off;"]

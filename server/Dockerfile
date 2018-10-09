FROM python:3.6.6

VOLUME [ "/var/www/data" ]

COPY . /var/www/

WORKDIR /var/www/server

RUN apt-get install curl \
                    bash \
                    gnupg \
                    make \
                    g++ \
 && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
 && apt-get update \
 && apt-get install nodejs \
 && npm install \
 && npm run build

ENV INSIDE_DOCKER true

CMD ["npm", "start"]

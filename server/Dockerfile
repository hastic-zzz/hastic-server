FROM python:3.6.6

RUN apt-get install curl \
                    bash \
                    gnupg \
                    make \
                    g++ \
 && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
 && apt-get update \
 && apt-get install nodejs

VOLUME [ "/var/www/data" ]

WORKDIR /var/www/server

COPY package.json /var/www/server

RUN npm install

COPY . /var/www/server

RUN npm run build

ENV INSIDE_DOCKER true

CMD ["npm", "start"]

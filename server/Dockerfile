#base image
FROM node:carbon AS base

#dependencies
FROM base AS dependencies
WORKDIR /var/www/server
COPY package*.json ./
RUN npm install

#build
FROM dependencies AS build
COPY . /var/www/server
WORKDIR /var/www/server
RUN npm run build

#release
FROM node:8.9-alpine AS release
WORKDIR /var/www/server
COPY --from=dependencies /var/www/server/package.json ./
RUN npm install
COPY --from=build /var/www/server ./

ENV INSIDE_DOCKER true
VOLUME [ "/var/www/data" ]
CMD ["npm", "start"]

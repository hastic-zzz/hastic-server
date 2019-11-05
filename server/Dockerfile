FROM node:8-alpine AS build

# tools for building zeromq

RUN apk add --no-cache curl gnupg make g++ bash python

# Note: context starts in directory above (see docker-compose file)
COPY server /var/www/server

# copy git head file for current branch
# if nothing specified in `git_branch` arg then whole directory will be copied
COPY .git/refs/heads /var/www/.git/refs/heads

WORKDIR /var/www/server

RUN npm install
RUN npm run build

FROM node:8-alpine

# Note: context starts in directory above (see docker-compose file)
COPY .git/HEAD /var/www/.git/
COPY server/package.json /var/www/server/

WORKDIR /var/www/server

COPY --from=build /var/www/server/dist /var/www/server/dist

VOLUME ["/var/www/data"]

ENV INSIDE_DOCKER true

CMD ["npm", "start"]

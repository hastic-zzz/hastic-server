FROM python:3

EXPOSE 8000

VOLUME [ \
  "/var/www/data/analytic_units", \
  "/var/www/data/datasets", \
  "/var/www/data/metrics", \
  "/var/www/data/models", \
  "/var/www/data/segments" \
]

COPY . /var/www

WORKDIR /var/www/analytics

RUN pip install -r requirements.txt

RUN apt-get update && apt-get install -y \
  apt-utils \
  gnupg \
  curl \
  python \
  make \
  g++ \
  git
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get update && apt-get install -y nodejs

WORKDIR /var/www/server

RUN npm install && npm run build

CMD ["npm", "start"]

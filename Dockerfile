FROM python:3

EXPOSE 8000

VOLUME [ "/var/www/src/anomalies", "/var/www/src/datasets", "/var/www/src/metrics", "/var/www/src/models", "/var/www/src/segments" ]

RUN pip install pandas
RUN pip install seglearn
RUN pip install scipy
RUN pip install tsfresh

COPY . /var/www

WORKDIR /var/www/server

RUN apt-get update && apt-get install -y \
  apt-utils \
  gnupg \
  curl \
  python \
  make \
  g++ \
  git
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -

RUN apt-get update && apt-get install -y nodejs

RUN npm install && npm run build

CMD ["npm", "start"]

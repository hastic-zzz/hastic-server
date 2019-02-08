FROM python:3.6.6

WORKDIR /var/www/analytics

COPY ./requirements.txt /var/www/analytics

RUN pip install -r requirements.txt \
 && apt-get update && apt-get install -y \
    apt-utils \
    gnupg \
    curl \
    make \
    g++ \
    git

VOLUME [ "/var/www/data" ]

COPY . /var/www/analytics/

CMD ["python", "-u", "bin/server"]

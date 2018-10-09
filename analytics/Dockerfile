FROM python:3.6.6

VOLUME [ "/var/www/data" ]

COPY . /var/www/analytics/

WORKDIR /var/www/analytics

RUN pip install -r requirements.txt \
 && apt-get update && apt-get install -y \
    apt-utils \
    gnupg \
    curl \
    make \
    g++ \
    git

CMD ["python", "server.py"]

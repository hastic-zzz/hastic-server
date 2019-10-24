FROM python:3.6.6 AS base

FROM base AS build

COPY analytics/requirements.txt /requirements.txt

RUN pip install -r /requirements.txt

WORKDIR /var/www/analytics

COPY analytics /var/www/analytics/


CMD ["python", "-u", "bin/server"]

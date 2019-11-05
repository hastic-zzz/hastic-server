FROM python:3.6.6

COPY requirements.txt /requirements.txt

RUN pip install -r /requirements.txt

WORKDIR /var/www/analytics

COPY . /var/www/analytics/


CMD ["python", "-u", "bin/server"]

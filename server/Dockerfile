FROM python:3.7-alpine

ENV PYTHONUNBUFFERED 1
ENV REDIS_HOST "redis"

RUN apk add --update --no-cache postgresql-client jpeg-dev
RUN apk add --update --no-cache --virtual .tmp-build-deps \
      build-base libc-dev linux-headers postgresql-dev zlib zlib-dev \
      python3-dev libffi-dev openssl-dev

RUN pip install --upgrade pip
COPY ./requirements.txt /requirements.txt
RUN pip install -r /requirements.txt
RUN apk del .tmp-build-deps

RUN mkdir /server
WORKDIR /server
COPY ./server /server

RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/static
RUN adduser -D user
RUN chown -R user:user /vol/
RUN chmod -R 755 /vol/web
USER user
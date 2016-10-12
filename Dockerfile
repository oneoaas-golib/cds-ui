FROM node:6.4.0

COPY dist/client /data
COPY setup /usr/bin/setup

RUN chmod +rx /usr/bin/setup

RUN npm install -g http-server

WORKDIR /data

CMD setup
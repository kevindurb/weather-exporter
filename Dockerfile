FROM docker.io/node:16-alpine

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY ./src ./src

CMD ["node", "."]
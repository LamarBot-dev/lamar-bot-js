FROM node:alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN yarn install --frozen-lockfile

COPY . /usr/src/bot

CMD ["yarn", "start"]
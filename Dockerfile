FROM node:22.15

WORKDIR /app

COPY package*.json ./
RUN yarn

COPY . .

RUN yarn build

CMD ["yarn", "start:prod"]

EXPOSE ${API_PORT}

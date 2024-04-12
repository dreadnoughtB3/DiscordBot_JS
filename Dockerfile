FROM node:20.10-alpine3.18
WORKDIR /app
COPY . .
RUN yarn install
CMD "node" "index.js"

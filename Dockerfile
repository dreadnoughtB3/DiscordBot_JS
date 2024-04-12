FROM node:20.10-alpine3.18
WORKDIR /app
COPY . .
RUN yarn install
EXPOSE 80 443
CMD "node" "index.js"

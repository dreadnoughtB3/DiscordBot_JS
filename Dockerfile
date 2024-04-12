FROM node:20.10-alpine3.18
WORKDIR /app
COPY "package.json" "./"
RUN yarn install
COPY . .
ENV PORT 80 443
EXPOSE 80 443
CMD "node" "index.js"

FROM jrottenberg/ffmpeg:6.1-alpine

WORKDIR /app

RUN apk add --no-cache nodejs npm curl

COPY package*.json ./
RUN npm install

COPY server.js .

EXPOSE 3001

CMD ["node", "server.js"]
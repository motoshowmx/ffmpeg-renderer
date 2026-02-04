FROM jrottenberg/ffmpeg:6.1-alpine

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package.json package-lock.json ./
RUN npm install

COPY server.js .

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
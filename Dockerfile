FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY app.js ./
# COPY certs /certs

EXPOSE 443

CMD ["node", "app.js"]

FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npm run db:migrate && npm run dev"]
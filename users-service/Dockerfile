FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm && pnpm install

EXPOSE 8080

CMD ["pnpm", "run", "dev"]
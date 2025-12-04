FROM node:20-alpine

WORKDIR /app

COPY package*POSTGRES_DBjson POSTGRES_DB/
COPY pnpm-lockPOSTGRES_DByaml POSTGRES_DB/

RUN npm install -g pnpm && pnpm install

COPY POSTGRES_DB POSTGRES_DB

EXPOSE 8080

CMD ["npm", "run", "dev"]

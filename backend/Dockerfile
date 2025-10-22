# Stage 1: Builder
FROM node:20 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN apt-get update && apt-get install -y python3 make g++ && npm rebuild bcrypt --build-from-source

COPY . .

RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY --from=builder package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]

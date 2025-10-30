FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:18
WORKDIR /app
COPY package*.json ./
COPY tailwind.config.js ./
COPY public ./public
COPY src ./src

RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
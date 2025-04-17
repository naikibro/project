FROM node:18
WORKDIR /app
COPY package*.json ./
COPY tailwind.config.js ./
COPY public ./public
COPY src ./src

RUN npm install
COPY . .

# Set the port to 8080 for Cloud Run
ENV PORT=8080
EXPOSE 8080

# Build the app for production
RUN npm run build

# Start the app based on NODE_ENV
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"dev\" ]; then npm run dev; else npm run start; fi"]
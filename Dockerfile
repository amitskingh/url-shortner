FROM node:23-alpine

# working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy package.json and package-lock.json
COPY . .

# Generate prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start in developement
# CMD ["npm", "run", "dev"]

# Start in production
CMD ["npm", "start"]


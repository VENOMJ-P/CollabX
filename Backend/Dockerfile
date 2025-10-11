# Use official Node.js image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend source code
COPY . .

# Set environment variable for Render
ENV PORT=10000

# Expose the port (Render sets its own port via $PORT)
EXPOSE 10000

# Start the app
CMD ["node", "src/index.js"]

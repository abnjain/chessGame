# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the project
COPY . .

# Expose the app port
EXPOSE 3000

# Set environment variables (optional)
ENV NODE_ENV=production

# Start the app
CMD ["node", "app.js"]

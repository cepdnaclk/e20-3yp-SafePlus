# Use Node.js 18 base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy only package files first (for better Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Copy certs inside container (optional: adjust if your certs are stored differently)
COPY certificate/ ./certificate/

# Expose the port your app listens on
EXPOSE 8000

# Start the app
CMD ["node", "index.js"]

FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

WORKDIR /app

# Copy the entire project
COPY . .

# Install root project dependencies
RUN npm install

# Change to frontend directory and install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build the frontend
RUN npm run build

# Change back to the main app directory
WORKDIR /app

# Expose the port
EXPOSE 8081

# Serve the application
CMD ["npm", "run", "serve"]
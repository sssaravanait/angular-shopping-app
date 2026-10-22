FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Install global Angular CLI
RUN npm install -g @angular/cli

# Expose the default Angular development server port
EXPOSE 4200

# Command to run when starting the container (keeps it running for development)
CMD ["tail", "-f", "/dev/null"]
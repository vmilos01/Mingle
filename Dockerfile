# use official Node.js LTS image
FROM node:20-alpine

# set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# install dependencies
RUN npm install --production

# copy the rest of the application code
COPY src ./src
COPY .env ./
COPY README.md ./

# expose the port (default 3000)
EXPOSE 3000

# start the API
CMD ["npm", "start"]
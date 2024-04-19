FROM node:18

WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY dist/ ./dist/
# COPY .env/ ./.env

CMD ["tail", "-f", "/dev/null"]
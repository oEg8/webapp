FROM node:18-alpine

WORKDIR /app/frontend

COPY frontend/package*.json /app/frontend/
COPY frontend/vite.config.js /app/frontend/vite.config.js

RUN npm install

COPY frontend /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:20-slim

WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Экспозиция порта (предполагаемый порт для WebSocket)
EXPOSE 3000

# Команда запуска
CMD ["node", "server.js"] 
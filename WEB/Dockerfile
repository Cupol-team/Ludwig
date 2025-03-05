FROM node:20-slim

WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Экспозиция порта
EXPOSE 5173

# Команда запуска
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 
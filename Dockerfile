# Используем последний образ Ubuntu
FROM ubuntu:latest

# Аргумент сборки для указания среды (dev или prod)
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Обновляем пакетный список и устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    coturn \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем nodemon глобально, если среда разработки
RUN if [ "$NODE_ENV" = "development" ]; then npm install -g nodemon; fi

# Генерация конфигурационного файла turnserver с указанными настройками
RUN echo "fingerprint" > /etc/turnserver.conf && \
    echo "listening-port=3478" >> /etc/turnserver.conf && \
    echo "listening-ip=0.0.0.0" >> /etc/turnserver.conf && \
    echo "no-auth" >> /etc/turnserver.conf && \
    echo "stun-only" >> /etc/turnserver.conf

# Создаем рабочую директорию для Node.js приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json ./

# Устанавливаем зависимости Node.js
RUN npm install

# Копируем исходный код приложения
COPY . .

# Устанавливаем переменную окружения для порта Node.js (например, 3000)
ENV PORT=3000

# Открываем порты для STUN сервера и Node.js приложения
EXPOSE 3000
EXPOSE 3478/udp

# Устанавливаем команду запуска в зависимости от среды
CMD if [ "$NODE_ENV" = "development" ]; then sh -c "turnserver -c /etc/turnserver.conf --no-cli & nodemon server.js"; else sh -c "turnserver -c /etc/turnserver.conf --no-cli & node server.js"; fi

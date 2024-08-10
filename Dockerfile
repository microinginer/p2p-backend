# Используем последний образ Ubuntu
FROM ubuntu:latest

# Обновляем пакетный список и устанавливаем необходимые зависимости
RUN apt-get update && apt-get install -y \
    coturn \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Аргументы для конфигурации coturn
ARG LISTENING_PORT=3478
ARG FINGERPRINT=true
ARG REALM=yourdomain.com
ARG NO_TLS=true
ARG NO_DTLS=true

# Генерация конфигурационного файла turnserver
RUN echo "listening-port=${LISTENING_PORT}" > /etc/turnserver.conf && \
    echo "fingerprint" >> /etc/turnserver.conf && \
    echo "lt-cred-mech" >> /etc/turnserver.conf && \
    echo "realm=${REALM}" >> /etc/turnserver.conf && \
    if [ "$NO_TLS" = true ]; then echo "no-tls" >> /etc/turnserver.conf; fi && \
    if [ "$NO_DTLS" = true ]; then echo "no-dtls" >> /etc/turnserver.conf; fi

# Создаем рабочую директорию для Node.js приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json ./

# Устанавливаем зависимости Node.js
RUN npm install --production

# Копируем исходный код приложения
COPY . .

# Устанавливаем переменную окружения для порта Node.js
ENV PORT=${NODE_PORT}

# Открываем порты для STUN сервера и Node.js приложения
EXPOSE ${NODE_PORT}
EXPOSE 3478/udp
EXPOSE 5349/tcp

# Запускаем coturn и Node.js приложение
CMD ["sh", "-c", "turnserver -c /etc/turnserver.conf --no-cli & node server.js"]

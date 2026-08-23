FROM python:3.10-slim
WORKDIR /app
# Kopiujemy skrypt serwera
COPY server.py .
EXPOSE 5000
# Odpalamy czysty skrypt Pythona
CMD ["python", "server.py"]

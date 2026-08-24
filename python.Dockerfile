# ZMIANA: Przełączamy na wersję 3.11-slim, aby bezpowrotnie zniszczyć stary cache Rendera!
FROM python:3.11-slim
WORKDIR /app
COPY server.py .
EXPOSE 5000
CMD ["python", "server.py"]

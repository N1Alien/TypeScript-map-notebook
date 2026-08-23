FROM node:20-alpine
WORKDIR /app
RUN npm install -g json-server@0.17.4
COPY db.json .
EXPOSE 4000
CMD ["json-server", "--watch", "db.json", "--port", "4000", "--host", "0.0.0.0"]

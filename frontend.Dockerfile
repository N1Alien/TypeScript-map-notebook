# Stage 1: Budowanie aplikacji React + Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serwowanie plików statycznych przez Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Kopiujemy domyślną konfigurację, aby React Router działał poprawnie (brak 404 przy odświeżaniu ścieżek)
RUN echo 'server { listen 8000; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]

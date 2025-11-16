# =========================================
# Stage 1: Build Frontend (React/Vite)
# =========================================
FROM node:20 AS frontend-build

WORKDIR /frontend

# Copy package.json + package-lock.json để tận dụng cache
COPY "C:/Users/MINH THU/frontend-ui/package*.json" ./

# Cài dependency
RUN npm ci

# Copy toàn bộ source FE
COPY "C:/Users/MINH THU/frontend-ui/" ./

# Build FE
RUN npm run build

# =========================================
# Stage 2: Build Backend (Spring Boot)
# =========================================
FROM maven:3.9.8-eclipse-temurin-21 AS backend-build

WORKDIR /app

# Copy pom.xml trước để cache dependency
COPY "C:/Users/MINH THU/Carbon-Credit-Marketplace-for-EV-Owners/pom.xml" ./
RUN mvn dependency:go-offline -B

# Copy toàn bộ source BE
COPY "C:/Users/MINH THU/Carbon-Credit-Marketplace-for-EV-Owners/src" ./src/

# Copy FE build vào target/classes/static để Spring Boot serve
RUN mkdir -p target/classes/static
COPY --from=frontend-build /frontend/build target/classes/static

# Build jar BE
RUN mvn clean package -DskipTests -B

# =========================================
# Stage 3: Runtime (chạy Spring Boot)
# =========================================
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy jar từ stage backend-build
COPY --from=backend-build /app/target/*.jar app.jar

# Thiết lập profile Spring Boot (nếu cần)
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

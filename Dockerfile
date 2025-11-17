# =========================================
# Stage 1: Build Frontend (React/Vite)
# =========================================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Only copy dependency manifests to leverage Docker layer cache
COPY frontend/package*.json ./

RUN npm ci --legacy-peer-deps

# Copy the full frontend source and build the production bundle
COPY frontend/ .
RUN npm run build

# =========================================
# Stage 2: Build Backend (Spring Boot)
# =========================================
FROM maven:3.9.8-eclipse-temurin-21 AS backend-build

WORKDIR /app

# Copy pom để cache dependency
COPY pom.xml ./

# Tải dependency 1 lần (nhanh hơn go-offline)
RUN mvn -B -q dependency:resolve

# Copy source
COPY src ./src

# Build jar (skip test cho nhanh)
RUN mvn -B -DskipTests clean package

# =========================================
# Stage 3: Runtime (Spring Boot JRE)
# =========================================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

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

# Cache Maven dependencies first
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

# Copy backend sources
COPY src ./src

# Copy the built frontend assets into Spring Boot static resources
RUN mkdir -p src/main/resources/static
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

# Package the backend (skip tests for faster container builds)
RUN mvn -B clean package -DskipTests

# =========================================
# Stage 3: Runtime (Spring Boot JRE)
# =========================================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=backend-build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# === Stage 1: Build stage ===
# FROM eclipse-temurin:17-jdk AS builder
FROM eclipse-temurin:17-jdk-jammy AS builder

# Set working directory
WORKDIR /app

# Copy only files needed to download dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x ./mvnw

# Pre-download dependencies (for build caching)
RUN ./mvnw dependency:go-offline

# Copy the rest of your source code
COPY src ./src

# Build the project (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# === Stage 2: Runtime stage ===
# FROM eclipse-temurin:17-jre-alpine
FROM eclipse-temurin:17-jre-jammy


WORKDIR /app

# Copy built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the same port as in application.properties
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]

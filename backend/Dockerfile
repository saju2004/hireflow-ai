# Multi-stage Dockerfile for Spring Boot Backend
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /build

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S hireflow && adduser -S hireflow -G hireflow && \
    mkdir -p /app/storage/resumes && \
    chown -R hireflow:hireflow /app

USER hireflow

COPY --from=builder /build/target/hireflow-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml lombok.config ./
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /deployments
RUN mkdir -p /deployments/logs
COPY --from=build /app/target/quarkus-app/lib/ ./lib/
COPY --from=build /app/target/quarkus-app/*.jar ./
COPY --from=build /app/target/quarkus-app/app/ ./app/
COPY --from=build /app/target/quarkus-app/quarkus/ ./quarkus/
EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0"
CMD ["sh", "-c", "java $JAVA_OPTS -jar quarkus-run.jar"]

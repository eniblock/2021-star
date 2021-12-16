FROM eclipse-temurin:11-alpine as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY api/pom.xml api/
COPY service/pom.xml service/

RUN ./mvnw dependency:go-offline -B
# cache build dependencies, without the sources
RUN ./mvnw package -DskipTests -B || true

COPY api/src api/src/
COPY service/src service/src/

RUN ./mvnw package -DskipTests -B
FROM eclipse-temurin:11-jre-alpine as dev
VOLUME /tmp

COPY --from=build  /workspace/app/api/target/api*.jar /app/api.jar
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5000","-jar","/app/api.jar"]

FROM dev
ENTRYPOINT ["java", "-jar","/app/api.jar"]

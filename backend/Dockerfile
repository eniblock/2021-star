FROM openjdk:11 as build
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

RUN ./mvnw  package -DskipTests -B
FROM openjdk:11 as dev
VOLUME /tmp

COPY --from=build  /workspace/app/api/target/api*.jar /app/api.jar
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=*:5005","-jar","/app/api.jar"]

FROM dev
ENTRYPOINT ["java", "-jar","/app/api.jar"]

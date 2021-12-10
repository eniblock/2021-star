FROM openjdk:11-jdk-slim as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN ./mvnw dependency:go-offline -B
# cache build dependencies, without the sources
RUN ./mvnw package -DskipTests -B || true

COPY src src

RUN ./mvnw package -DskipTests -B
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../*.jar)

FROM openjdk:11-jdk as dev
VOLUME /tmp
ARG DEPENDENCY=/workspace/app/target/dependency
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5000","-cp","app:app/lib/*","star.ApiApplication"]

FROM dev
ENTRYPOINT ["java", "-cp", "app:app/lib/*", "star.ApiApplication"]

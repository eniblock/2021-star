FROM openjdk:11 as build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY api/pom.xml api/
COPY service/pom.xml service/

RUN --mount=type=cache,target=/root/.m2 \
  ./mvnw dependency:go-offline -B
# cache build dependencies, without the sources
RUN --mount=type=cache,target=/root/.m2 \
  ./mvnw package -DskipTests -B || true

COPY api/src api/src/
COPY service/src service/src/

RUN --mount=type=cache,target=/root/.m2 \
  ./mvnw  package -DskipTests -B


FROM openjdk:11 as dev
# required to validate rte certificates
RUN cd /usr/local/share/ca-certificates/ \
  && wget https://globalsign.tbs-certificats.com/gsrsaovsslca2018.crt \
  && update-ca-certificates
VOLUME /tmp
COPY --from=build  /workspace/app/api/target/api*.jar /app/api.jar
ENTRYPOINT ["java","-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005","-jar","/app/api.jar"]

FROM dev
ENTRYPOINT ["java", "-jar","/app/api.jar"]

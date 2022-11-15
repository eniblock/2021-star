VERSION 0.6

sonar:
    FROM sonarsource/sonar-scanner-cli
    RUN apk add yq
    COPY . ./
    COPY ./backend+build/api-*.jar ./
    RUN echo sonar.projectVersion=$(yq eval .version helm/star/Chart.yaml) >> sonar-project.properties
    ENV SONAR_HOST_URL=https://sonarcloud.io
    RUN --mount=type=cache,target=/opt/sonar-scanner/.sonar/cache \
        --secret GITHUB_TOKEN \
        --secret SONAR_TOKEN \
        sonar-scanner \
        -D sonar.java.binaries=$(ls api-*.jar)

VERSION 0.6

sonar:
    FROM mikefarah/yq
    COPY . ./
    RUN echo sonar.projectVersion=$(yq eval .version helm/star/Chart.yaml) >> sonar-project.properties
    RUN mkdir bin lib
    COPY ./backend+build/api*.jar bin/
    COPY ./backend+build/lombok*.jar lib/
    SAVE ARTIFACT sonar-project.properties AS LOCAL ./
    SAVE ARTIFACT bin AS LOCAL ./bin
    SAVE ARTIFACT lib AS LOCAL ./lib

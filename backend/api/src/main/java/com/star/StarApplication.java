package com.star;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@SpringBootApplication
@Slf4j
public class StarApplication {

    @Value("${keycloak.credentials.secret}")
    private String clientSecret;

    public static void main(String[] args) {
        SpringApplication.run(StarApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner() {
        return (args) -> {
            log.debug("Debut d'exécution de la commande line runner");
            log.debug("Valeur récupérée pour le clientSecret : "+clientSecret);
        };
    }
}

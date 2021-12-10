package com.star.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    private static final String message = "Hello Docker Backend Star apps !";

    @GetMapping("/hello")
    public String greeting() {
        return message;
    }

}

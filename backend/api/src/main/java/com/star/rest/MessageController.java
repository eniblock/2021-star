package com.star.rest;

import com.star.models.Message;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(MessageController.PATH)
public class MessageController {

    public static final String PATH = "/api";
    private static final String MESSAGE_ADMIN = "Hello Docker Backend Star apps for admin !";
    private static final String MESSAGE_MANAGER = "Hello Docker Backend Star apps for manager !";

    @GetMapping("/admin")
    public Message admin() {
        return new Message(MESSAGE_ADMIN);
    }

    @GetMapping("/manager")
    public Message manager() {
        return new Message(MESSAGE_MANAGER);
    }


}

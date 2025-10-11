package com.zkylab.harvest.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/greetings")
public class GreetingController {

    @GetMapping("/")
    public String home() {
        return "Welcome to the Harvest API! Try /api/greetings";
    }

    // Endpoint 1: Handles GET requests to /api/greetings
    @GetMapping
    public String getGreeting() {
        return "Hello, World! Welcome to your first Spring Boot API.";
    }

    // Endpoint 2: Handles GET requests to /api/greetings/{name}
    @GetMapping("/{name}")
    public String getPersonalizedGreeting(@PathVariable String name) {
        return "Hello, " + name + "! Have a great day.";
    }

    @GetMapping("/secure")
    public String getSecureGreeting() {
        return "Hello, authenticated user! This is a secure endpoint.";
    }

}
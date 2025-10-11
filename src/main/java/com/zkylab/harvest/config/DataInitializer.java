package com.zkylab.harvest.config;

import com.zkylab.harvest.model.User;
import com.zkylab.harvest.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User user = new User();
                user.setUsername("admin");
                user.setPassword(encoder.encode("password123")); // password will be hashed
                userRepository.save(user);
                System.out.println("✅ Created default user: admin / password123");
            }
        };
    }
}

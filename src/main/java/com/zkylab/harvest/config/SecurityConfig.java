package com.zkylab.harvest.config;

import com.zkylab.harvest.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.User;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless REST APIs
                .authorizeHttpRequests(auth -> auth
                        // Allow registration, login and public greeting endpoints to be accessed without authentication
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/social-login", "/api/auth/verify-otp", "/api/auth/resend-otp", "/api/auth/refresh-token", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/greetings/**").permitAll()
                        // Allow Swagger UI and API docs to be accessed without authentication
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Any other request must be authenticated (logout and change-password require auth)
                        .anyRequest().authenticated()
                )
                // Enable HTTP Basic Authentication
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByUsername(username)
                .map(user -> User.withUsername(user.getUsername())
                        .password(user.getPassword())
                        .roles("USER") // You can add roles here if needed
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // This is the standard for hashing passwords. NEVER store plain text passwords.
        return new BCryptPasswordEncoder();
    }
}

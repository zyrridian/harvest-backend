package com.zkylab.harvest.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Service - Handles token generation and validation
 * 
 * This service creates and verifies JWT tokens for user authentication.
 * JWT (JSON Web Token) is a secure way to transmit information between parties.
 */
@Service
public class JwtService {

    // Secret key for signing tokens - In production, store this in environment variables!
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    
    // Token expiration times (in milliseconds)
    private static final long ACCESS_TOKEN_VALIDITY = 1000 * 60 * 60; // 1 hour
    private static final long REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24 * 7; // 7 days
    private static final long REMEMBER_ME_VALIDITY = 1000 * 60 * 60 * 24 * 30; // 30 days

    /**
     * Generate access token for authenticated user
     * 
     * @param userId User's ID
     * @param email User's email
     * @param rememberMe Whether to extend token validity
     * @return JWT access token
     */
    public String generateAccessToken(Long userId, String email, boolean rememberMe) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "access");
        
        long validity = rememberMe ? REMEMBER_ME_VALIDITY : ACCESS_TOKEN_VALIDITY;
        
        return createToken(claims, email, validity);
    }

    /**
     * Generate refresh token for token renewal
     * 
     * @param userId User's ID
     * @param email User's email
     * @return JWT refresh token
     */
    public String generateRefreshToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "refresh");
        
        return createToken(claims, email, REFRESH_TOKEN_VALIDITY);
    }

    /**
     * Create JWT token with claims and expiration
     * 
     * @param claims Token payload data
     * @param subject Token subject (usually email)
     * @param validity Token validity duration in milliseconds
     * @return JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject, long validity) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + validity);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Extract user email from token
     * 
     * @param token JWT token
     * @return User email
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract user ID from token
     * 
     * @param token JWT token
     * @return User ID
     */
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }

    /**
     * Extract specific claim from token
     * 
     * @param token JWT token
     * @param claimsResolver Function to extract specific claim
     * @return Claim value
     */
    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token
     * 
     * @param token JWT token
     * @return All claims
     */
    private Claims extractAllClaims(String token) {
    // use parserBuilder() which is the modern API for jjwt 0.11+
    return Jwts.parser()
        .setSigningKey(SECRET_KEY)
        .build()
        .parseClaimsJws(token)
        .getBody();
    }

    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extract expiration date from token
     * 
     * @param token JWT token
     * @return Expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Validate token
     * 
     * @param token JWT token
     * @param email User email to validate against
     * @return true if valid, false otherwise
     */
    public Boolean validateToken(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

    /**
     * Get token expiration time in seconds
     * 
     * @param rememberMe Whether user chose remember me
     * @return Expiration time in seconds
     */
    public int getExpirationTimeInSeconds(boolean rememberMe) {
        return rememberMe ? (int) (REMEMBER_ME_VALIDITY / 1000) : (int) (ACCESS_TOKEN_VALIDITY / 1000);
    }
}

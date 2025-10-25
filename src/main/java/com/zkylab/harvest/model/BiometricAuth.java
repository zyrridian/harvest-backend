package com.zkylab.harvest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * BiometricAuth Entity - Stores biometric authentication data for devices
 * 
 * Each user can register multiple devices with biometric authentication.
 * The public key is stored for signature verification (in production scenarios).
 */
@Entity
@Table(name = "biometric_auth")
public class BiometricAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "public_key", columnDefinition = "TEXT")
    private String publicKey;

    @Column(name = "biometric_type")
    private String biometricType; // fingerprint, face, etc.

    @Column(name = "platform")
    private String platform; // android, ios, web

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @PrePersist
    protected void onCreate() {
        registeredAt = LocalDateTime.now();
        lastUsedAt = LocalDateTime.now();
    }

    // Constructors
    public BiometricAuth() {
    }

    public BiometricAuth(User user, String deviceId, String deviceName, String publicKey, String biometricType, String platform) {
        this.user = user;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.publicKey = publicKey;
        this.biometricType = biometricType;
        this.platform = platform;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getBiometricType() {
        return biometricType;
    }

    public void setBiometricType(String biometricType) {
        this.biometricType = biometricType;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(LocalDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}

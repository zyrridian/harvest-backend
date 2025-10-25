package com.zkylab.harvest.repository;

import com.zkylab.harvest.model.BiometricAuth;
import com.zkylab.harvest.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BiometricAuthRepository extends JpaRepository<BiometricAuth, Long> {
    Optional<BiometricAuth> findByDeviceId(String deviceId);
    List<BiometricAuth> findByUser(User user);
    List<BiometricAuth> findByUserAndIsActive(User user, Boolean isActive);
    Optional<BiometricAuth> findByDeviceIdAndIsActive(String deviceId, Boolean isActive);
}

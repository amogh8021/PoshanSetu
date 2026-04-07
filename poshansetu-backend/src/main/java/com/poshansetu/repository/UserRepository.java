package com.poshansetu.repository;

import com.poshansetu.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByPhone(String phone);
    java.util.List<User> findAllByAnganwadiId(String anganwadiId);
}

package com.poshansetu.repository;

import com.poshansetu.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChildRepository extends JpaRepository<Child, UUID> {
    List<Child> findAllByParentId(UUID parentId);
    List<Child> findAllByAnganwadiId(String anganwadiId);
}

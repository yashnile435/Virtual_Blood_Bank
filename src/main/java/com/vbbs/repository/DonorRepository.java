package com.vbbs.repository;

import com.vbbs.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    List<Donor> findByBloodGroup(String bloodGroup);
    Optional<Donor> findByEmail(String email);
    boolean existsByEmail(String email);
}

package com.vbbs.config;

import com.vbbs.model.Admin;
import com.vbbs.model.BloodInventory;
import com.vbbs.model.Donor;
import com.vbbs.repository.AdminRepository;
import com.vbbs.repository.BloodInventoryRepository;
import com.vbbs.repository.DonorRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final BloodInventoryRepository inventoryRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize Admin if none exists
        if (!adminRepository.existsByUsername("admin")) {
            System.out.println("🌱 Initializing Admin User...");
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            adminRepository.save(admin);
            System.out.println("✅ Admin created: admin / admin123");
        }

        // Initialize Inventory if empty
        if (inventoryRepository.count() == 0) {
            System.out.println("🌱 Seeding Blood Inventory...");
            createInventory("A+", 50);
            createInventory("A-", 20);
            createInventory("B+", 45);
            createInventory("B-", 15);
            createInventory("O+", 100);
            createInventory("O-", 30);
            createInventory("AB+", 25);
            createInventory("AB-", 10);
            System.out.println("✅ Inventory seeded.");
        }

        // Initialize Donors if empty
        if (donorRepository.count() == 0) {
            System.out.println("🌱 Seeding Sample Donors...");
            createDonor("John Doe", "A+", "New York", "1234567890", "john@example.com");
            createDonor("Jane Smith", "O-", "London", "0987654321", "jane@example.com");
            createDonor("Alice Johnson", "B+", "Paris", "1122334455", "alice@example.com");
            System.out.println("✅ Donors seeded.");
        }
    }

    private void createInventory(String group, int units) {
        BloodInventory item = new BloodInventory();
        item.setBloodGroup(group);
        item.setUnitsAvailable(units);
        item.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(item);
    }

    private void createDonor(String name, String group, String city, String phone, String email) {
        // Check if donor already exists (e.g. from data.sql)
        if (donorRepository.existsByEmail(email))
            return;

        Donor donor = new Donor();
        donor.setName(name);
        donor.setBloodGroup(group);
        donor.setCity(city);
        donor.setPhone(phone);
        donor.setEmail(email);
        donor.setAvailable(true);
        donor.setLastDonationDate(LocalDate.now().minusMonths(6));

        // Critical Fix: Set Password and Role
        donor.setPassword(passwordEncoder.encode("admin123")); // Default password
        donor.setRole("ROLE_USER");

        donorRepository.save(donor);
    }
}

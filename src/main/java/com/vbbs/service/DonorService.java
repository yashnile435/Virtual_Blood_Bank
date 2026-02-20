package com.vbbs.service;

import com.vbbs.dto.DonorDto;
import com.vbbs.exception.BadRequestException;
import com.vbbs.exception.ResourceNotFoundException;
import com.vbbs.model.Donor;
import com.vbbs.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;

    public Donor registerDonor(DonorDto donorDto) {
        if (donorRepository.existsByEmail(donorDto.getEmail())) {
            throw new BadRequestException("Email already in use!");
        }

        Donor donor = Donor.builder()
                .name(donorDto.getName())
                .email(donorDto.getEmail())
                .phone(donorDto.getPhone())
                .bloodGroup(donorDto.getBloodGroup())
                .city(donorDto.getCity())
                .available(true) // Default available
                .build();

        return donorRepository.save(donor);
    }

    public List<Donor> getAllDonors() {
        return donorRepository.findAll();
    }

    public List<Donor> getDonorsByBloodGroup(String bloodGroup) {
        return donorRepository.findByBloodGroup(bloodGroup);
    }

    public Donor updateAvailability(Long id, boolean available, LocalDate lastDonationDate) {
        Donor donor = donorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with id: " + id));
        
        if (available && lastDonationDate != null) {
             LocalDate ninetyDaysAgo = LocalDate.now().minusDays(90);
             if (lastDonationDate.isAfter(ninetyDaysAgo)) {
                 throw new BadRequestException("Cannot be available. Last donation was less than 90 days ago.");
             }
        }
        
        donor.setAvailable(available);
        if (lastDonationDate != null) {
            donor.setLastDonationDate(lastDonationDate);
        }
        
        return donorRepository.save(donor);
    }
}

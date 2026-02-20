package com.vbbs.controller;

import com.vbbs.dto.DonorDto;
import com.vbbs.model.Donor;
import com.vbbs.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @PostMapping
    public ResponseEntity<Donor> registerDonor(@Valid @RequestBody DonorDto donorDto) {
        return ResponseEntity.ok(donorService.registerDonor(donorDto));
    }

    @GetMapping
    public ResponseEntity<List<Donor>> getAllDonors() {
        return ResponseEntity.ok(donorService.getAllDonors());
    }

    @GetMapping("/{bloodGroup}")
    public ResponseEntity<List<Donor>> getDonorsByBloodGroup(@PathVariable String bloodGroup) {
        return ResponseEntity.ok(donorService.getDonorsByBloodGroup(bloodGroup));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Donor> getDonorById(@PathVariable Long id) {
        return ResponseEntity.ok(donorService.getAllDonors().stream().filter(d -> d.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Donor not found")));
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<Donor> updateAvailability(@PathVariable Long id,
            @RequestParam boolean available,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate lastDonationDate) {
        return ResponseEntity.ok(donorService.updateAvailability(id, available, lastDonationDate));
    }
}

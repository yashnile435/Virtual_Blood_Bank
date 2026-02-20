package com.vbbs.service;

import com.vbbs.dto.BloodInventoryDto;
import com.vbbs.exception.ResourceNotFoundException;
import com.vbbs.model.BloodInventory;
import com.vbbs.repository.BloodInventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BloodInventoryService {

    private final BloodInventoryRepository inventoryRepository;

    public BloodInventory updateInventory(BloodInventoryDto dto) {
        Optional<BloodInventory> existing = inventoryRepository.findByBloodGroup(dto.getBloodGroup());
        
        BloodInventory inventory;
        if (existing.isPresent()) {
            inventory = existing.get();
            inventory.setUnitsAvailable(inventory.getUnitsAvailable() + dto.getUnits());
        } else {
            inventory = BloodInventory.builder()
                    .bloodGroup(dto.getBloodGroup())
                    .unitsAvailable(dto.getUnits())
                    .build();
        }
        return inventoryRepository.save(inventory);
    }

    public List<BloodInventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    @Transactional
    public BloodInventory deductInventory(String bloodGroup, int units) {
        BloodInventory inventory = inventoryRepository.findByBloodGroup(bloodGroup)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for blood group: " + bloodGroup));
        
        if (inventory.getUnitsAvailable() < units) {
            throw new RuntimeException("Insufficient stock for " + bloodGroup);
        }
        
        inventory.setUnitsAvailable(inventory.getUnitsAvailable() - units);
        return inventoryRepository.save(inventory);
    }
}

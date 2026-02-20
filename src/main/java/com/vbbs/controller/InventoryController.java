package com.vbbs.controller;

import com.vbbs.dto.BloodInventoryDto;
import com.vbbs.model.BloodInventory;
import com.vbbs.service.BloodInventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {
    
    private final BloodInventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BloodInventory> updateInventory(@Valid @RequestBody BloodInventoryDto dto) {
        return ResponseEntity.ok(inventoryService.updateInventory(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BloodInventory>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }
    
    @PutMapping("/{bloodGroup}/deduct")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BloodInventory> deductInventory(@PathVariable String bloodGroup, @RequestParam int units) {
        return ResponseEntity.ok(inventoryService.deductInventory(bloodGroup, units));
    }
}

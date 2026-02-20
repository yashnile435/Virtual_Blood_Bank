package com.vbbs.service;

import com.vbbs.dto.BloodRequestDto;
import com.vbbs.exception.BadRequestException;
import com.vbbs.exception.ResourceNotFoundException;
import com.vbbs.model.BloodInventory;
import com.vbbs.model.BloodRequest;
import com.vbbs.model.RequestStatus;
import com.vbbs.repository.BloodInventoryRepository;
import com.vbbs.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final BloodInventoryService inventoryService; 
    private final BloodInventoryRepository inventoryRepository;

    public BloodRequest createRequest(BloodRequestDto dto) {
        BloodRequest request = BloodRequest.builder()
                .patientName(dto.getPatientName())
                .bloodGroup(dto.getBloodGroup())
                .unitsRequired(dto.getUnitsRequired())
                .hospitalName(dto.getHospitalName())
                .city(dto.getCity())
                .status(RequestStatus.PENDING)
                .build();
        return requestRepository.save(request);
    }

    public List<BloodRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    @Transactional
    public BloodRequest approveRequest(Long id) {
        BloodRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        
        if (request.getStatus() != RequestStatus.PENDING) {
             throw new BadRequestException("Request is not in PENDING state");
        }
        
        // Check stock
        BloodInventory inventory = inventoryRepository.findByBloodGroup(request.getBloodGroup())
                .orElseThrow(() -> new BadRequestException("No inventory for blood group " + request.getBloodGroup()));
        
        if (inventory.getUnitsAvailable() < request.getUnitsRequired()) {
            throw new BadRequestException("Insufficient stock to approve request");
        }
        
        // Deduct logic
        inventoryService.deductInventory(request.getBloodGroup(), request.getUnitsRequired());
        
        request.setStatus(RequestStatus.APPROVED);
        return requestRepository.save(request);
    }
    
    public BloodRequest rejectRequest(Long id) {
         BloodRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
         
         if (request.getStatus() != RequestStatus.PENDING) {
             throw new BadRequestException("Request is not in PENDING state");
        }
         
         request.setStatus(RequestStatus.REJECTED);
         return requestRepository.save(request);
    }
}

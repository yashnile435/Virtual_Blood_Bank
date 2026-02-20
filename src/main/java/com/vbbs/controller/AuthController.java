package com.vbbs.controller;

import com.vbbs.config.JwtUtils;
import com.vbbs.dto.JwtResponse;
import com.vbbs.dto.LoginRequest;
import com.vbbs.dto.MessageResponse;
import com.vbbs.model.Admin;
import com.vbbs.repository.AdminRepository;
import com.vbbs.service.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.vbbs.dto.SignupRequest;
import com.vbbs.model.Donor;
import com.vbbs.repository.DonorRepository;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getAuthorities().toString()));
    }

    // Helper to create initial admin if none exists
    @PostMapping("/setup")
    public ResponseEntity<?> setupAdmin() {
        if (adminRepository.existsByUsername("admin")) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Admin already exists!"));
        }
        Admin admin = new Admin();
        admin.setUsername("admin");
        admin.setPassword(encoder.encode("admin123"));
        admin.setRole("ROLE_ADMIN");
        adminRepository.save(admin);

        return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (adminRepository.existsByUsername(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already taken by Admin!"));
        }

        if (donorRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new donor
        Donor donor = new Donor();
        donor.setName(signUpRequest.getName());
        donor.setEmail(signUpRequest.getEmail());
        donor.setPassword(encoder.encode(signUpRequest.getPassword()));
        donor.setRole("ROLE_USER");
        donor.setPhone(signUpRequest.getPhone());
        donor.setCity(signUpRequest.getCity());
        donor.setBloodGroup(signUpRequest.getBloodGroup());
        donor.setAvailable(signUpRequest.isAvailable());

        donorRepository.save(donor);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}

package com.vbbs.service;

import com.vbbs.model.Admin;
import com.vbbs.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminRepository adminRepository;

    private final com.vbbs.repository.DonorRepository donorRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try Admin
        java.util.Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            return UserDetailsImpl.build(admin.get());
        }

        // Try Donor (username is email)
        com.vbbs.model.Donor donor = donorRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username/email: " + username));

        return UserDetailsImpl.build(donor);
    }
}

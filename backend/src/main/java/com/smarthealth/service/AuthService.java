package com.smarthealth.service;

import com.smarthealth.config.JwtTokenProvider;
import com.smarthealth.dto.AuthRequest;
import com.smarthealth.dto.AuthResponse;
import com.smarthealth.dto.UserDto;
import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.ERole;
import com.smarthealth.model.Role;
import com.smarthealth.model.User;
import com.smarthealth.repository.DistrictRepository;
import com.smarthealth.repository.RoleRepository;
import com.smarthealth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DistrictRepository districtRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + loginRequest.getUsername()));

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .state(user.getState())
                .districtId(user.getDistrict() != null ? user.getDistrict().getId() : null)
                .districtName(user.getDistrict() != null ? user.getDistrict().getDistrictName() : null)
                .subCentre(user.getSubCentre())
                .build();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("No authenticated user in current session");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found: " + username));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(UserDto userDto, String plainPassword) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new BadRequestException("Username is already taken: " + userDto.getUsername());
        }

        ERole eRole = ERole.valueOf(userDto.getRole());
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + userDto.getRole()));

        User user = User.builder()
                .username(userDto.getUsername())
                .password(passwordEncoder.encode(plainPassword))
                .fullName(userDto.getFullName())
                .email(userDto.getEmail())
                .phone(userDto.getPhone())
                .role(role)
                .state(userDto.getState() != null ? userDto.getState() : "Assam")
                .subCentre(userDto.getSubCentre())
                .isActive(true)
                .build();

        if (userDto.getDistrictId() != null) {
            user.setDistrict(districtRepository.findById(userDto.getDistrictId()).orElse(null));
        }

        User saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    public UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName().name())
                .state(user.getState())
                .districtId(user.getDistrict() != null ? user.getDistrict().getId() : null)
                .districtName(user.getDistrict() != null ? user.getDistrict().getDistrictName() : null)
                .subCentre(user.getSubCentre())
                .isActive(user.getIsActive())
                .build();
    }
}

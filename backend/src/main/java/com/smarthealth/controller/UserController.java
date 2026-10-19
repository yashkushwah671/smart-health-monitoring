package com.smarthealth.controller;

import com.smarthealth.dto.UserDto;
import com.smarthealth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "User administration and role allocation endpoints")
public class UserController {

    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users (Admin only)")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register new health worker or officer account (Admin only)")
    public ResponseEntity<UserDto> createUser(@RequestBody Map<String, Object> payload) {
        UserDto userDto = UserDto.builder()
                .username((String) payload.get("username"))
                .fullName((String) payload.get("fullName"))
                .email((String) payload.get("email"))
                .phone((String) payload.get("phone"))
                .role((String) payload.get("role"))
                .state((String) payload.get("state"))
                .subCentre((String) payload.get("subCentre"))
                .districtId(payload.get("districtId") != null ? Long.valueOf(payload.get("districtId").toString()) : null)
                .build();

        String password = (String) payload.getOrDefault("password", "password123");
        UserDto created = authService.createUser(userDto, password);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}

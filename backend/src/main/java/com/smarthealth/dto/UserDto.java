package com.smarthealth.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String state;
    private Long districtId;
    private String districtName;
    private String subCentre;
    private Boolean isActive;
}

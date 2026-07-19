package com.knittingstories.user.dto;

import com.knittingstories.user.Role;
import com.knittingstories.user.User;
import com.knittingstories.user.UserStatus;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        UserStatus status,
        String shopName
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(),
                user.getRole(), user.getStatus(), user.getShopName());
    }
}

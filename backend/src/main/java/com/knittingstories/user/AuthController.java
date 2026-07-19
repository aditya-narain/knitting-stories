package com.knittingstories.user;

import com.knittingstories.common.ApiException;
import com.knittingstories.security.UserPrincipal;
import com.knittingstories.user.dto.AuthResponse;
import com.knittingstories.user.dto.LoginRequest;
import com.knittingstories.user.dto.RegisterRequest;
import com.knittingstories.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw ApiException.unauthorized("Not authenticated");
        }
        return userRepository.findById(principal.getId())
                .map(UserResponse::from)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }
}

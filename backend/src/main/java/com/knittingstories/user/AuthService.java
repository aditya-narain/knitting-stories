package com.knittingstories.user;

import com.knittingstories.common.ApiException;
import com.knittingstories.security.JwtService;
import com.knittingstories.user.dto.AuthResponse;
import com.knittingstories.user.dto.LoginRequest;
import com.knittingstories.user.dto.RegisterRequest;
import com.knittingstories.user.dto.UserResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw ApiException.badRequest("Admin accounts cannot be self-registered");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.email().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setStatus(UserStatus.ACTIVE);
        if (request.role() == Role.SELLER) {
            user.setShopName(request.shopName());
        }
        userRepository.save(user);

        return new AuthResponse(issueToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password()));
        } catch (BadCredentialsException e) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (user.getStatus() == UserStatus.BLACKLISTED) {
            throw ApiException.forbidden("This account has been suspended");
        }
        return new AuthResponse(issueToken(user), UserResponse.from(user));
    }

    private String issueToken(User user) {
        return jwtService.generateToken(user.getEmail(),
                Map.of("role", user.getRole().name(), "uid", user.getId().toString()));
    }
}

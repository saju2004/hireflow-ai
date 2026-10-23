package com.hireflow.auth;

import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.BadRequestException;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.organization.*;
import com.hireflow.security.CustomUserDetailsService;
import com.hireflow.security.JwtTokenProvider;
import com.hireflow.security.SecurityUtils;
import com.hireflow.security.UserPrincipal;
import com.hireflow.user.Role;
import com.hireflow.user.User;
import com.hireflow.user.UserRepository;
import com.hireflow.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Value("${hireflow.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${hireflow.jwt.access-token-expiration-ms:900000}")
    private long accessTokenExpirationMs;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Account is suspended. Please contact platform administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String rawRefreshToken = generateAndSaveRefreshToken(user);

        return buildAuthResponse(accessToken, rawRefreshToken, userPrincipal);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        UUID orgId = null;
        String orgName = null;

        if (request.getRole() == Role.RECRUITER) {
            String orgTitle = request.getOrganizationName() != null && !request.getOrganizationName().isBlank()
                    ? request.getOrganizationName().trim()
                    : request.getFirstName() + "'s Organization";

            String slug = orgTitle.toLowerCase().replaceAll("[^a-z0-9]+", "-") + "-" + UUID.randomUUID().toString().substring(0, 6);

            Organization organization = Organization.builder()
                    .name(orgTitle)
                    .slug(slug)
                    .status(OrganizationStatus.ACTIVE)
                    .build();
            organization = organizationRepository.save(organization);

            OrganizationMembership membership = OrganizationMembership.builder()
                    .organization(organization)
                    .user(user)
                    .roleInOrg(OrgRole.OWNER)
                    .build();
            membershipRepository.save(membership);

            orgId = organization.getId();
            orgName = organization.getName();
        } else if (request.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = CandidateProfile.builder()
                    .user(user)
                    .yearsOfExperience(0.0)
                    .build();
            candidateProfileRepository.save(profile);
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user, orgId, orgName);
        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String rawRefreshToken = generateAndSaveRefreshToken(user);

        return buildAuthResponse(accessToken, rawRefreshToken, userPrincipal);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String hashedToken = hashToken(request.getRefreshToken());

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new BadRequestException("Refresh token has expired or been revoked. Please log in again.");
        }

        User user = refreshToken.getUser();
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Account is suspended.");
        }

        // Token rotation: Revoke current token and generate new one
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserById(user.getId());
        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);
        String newRawRefreshToken = generateAndSaveRefreshToken(user);

        return buildAuthResponse(newAccessToken, newRawRefreshToken, userPrincipal);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hashedToken = hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hashedToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        UserPrincipal principal = SecurityUtils.getRequiredCurrentUser();
        return UserDto.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .firstName(principal.getFirstName())
                .lastName(principal.getLastName())
                .fullName(principal.getFirstName() + " " + principal.getLastName())
                .role(principal.getRole())
                .status(principal.getStatus())
                .organizationId(principal.getOrganizationId())
                .organizationName(principal.getOrganizationName())
                .build();
    }

    private String generateAndSaveRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hashed = hashToken(rawToken);

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashed)
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(entity);
        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, UserPrincipal principal) {
        UserDto userDto = UserDto.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .firstName(principal.getFirstName())
                .lastName(principal.getLastName())
                .fullName(principal.getFirstName() + " " + principal.getLastName())
                .role(principal.getRole())
                .status(principal.getStatus())
                .organizationId(principal.getOrganizationId())
                .organizationName(principal.getOrganizationName())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .user(userDto)
                .build();
    }
}

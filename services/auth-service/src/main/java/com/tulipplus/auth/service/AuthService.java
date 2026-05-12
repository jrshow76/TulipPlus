package com.tulipplus.auth.service;

import com.tulipplus.auth.common.BusinessException;
import com.tulipplus.auth.domain.RefreshToken;
import com.tulipplus.auth.domain.User;
import com.tulipplus.auth.dto.LoginRequest;
import com.tulipplus.auth.dto.RegisterRequest;
import com.tulipplus.auth.dto.TokenResponse;
import com.tulipplus.auth.mapper.RefreshTokenMapper;
import com.tulipplus.auth.mapper.UserMapper;
import com.tulipplus.auth.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserMapper userMapper, RefreshTokenMapper refreshTokenMapper,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userMapper.existsByEmail(req.getEmail()) > 0) {
            throw new BusinessException("EMAIL_EXISTS", "이미 사용 중인 이메일입니다.", HttpStatus.CONFLICT);
        }
        if (userMapper.existsByUsername(req.getUsername()) > 0) {
            throw new BusinessException("USERNAME_EXISTS", "이미 사용 중인 사용자명입니다.", HttpStatus.CONFLICT);
        }

        User u = new User();
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setUsername(req.getUsername());
        u.setRole("USER");
        u.setStatus("ACTIVE");
        userMapper.insertUser(u);

        userMapper.insertProfile(u.getId(), req.getFullName(), req.getPhone());

        return issueTokens(u);
    }

    @Transactional
    public TokenResponse login(LoginRequest req) {
        User u = userMapper.findByEmail(req.getEmail());
        if (u == null || !passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new BusinessException("AUTH_INVALID", "이메일 또는 비밀번호가 올바르지 않습니다.", HttpStatus.UNAUTHORIZED);
        }
        if (!"ACTIVE".equals(u.getStatus())) {
            throw new BusinessException("ACCOUNT_INACTIVE", "비활성 계정입니다.", HttpStatus.FORBIDDEN);
        }
        userMapper.updateLastLogin(u.getId());
        return issueTokens(u);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtUtil.isValid(refreshToken)) {
            throw new BusinessException("INVALID_TOKEN", "유효하지 않은 리프레시 토큰입니다.", HttpStatus.UNAUTHORIZED);
        }
        RefreshToken stored = refreshTokenMapper.findByToken(refreshToken);
        if (stored == null) {
            throw new BusinessException("TOKEN_NOT_FOUND", "토큰을 찾을 수 없습니다.", HttpStatus.UNAUTHORIZED);
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenMapper.deleteByToken(refreshToken);
            throw new BusinessException("TOKEN_EXPIRED", "토큰이 만료되었습니다.", HttpStatus.UNAUTHORIZED);
        }

        User u = userMapper.findById(stored.getUserId());
        if (u == null) {
            throw new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", HttpStatus.UNAUTHORIZED);
        }
        // Rotate refresh token
        refreshTokenMapper.deleteByToken(refreshToken);
        return issueTokens(u);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenMapper.deleteByToken(refreshToken);
        }
    }

    private TokenResponse issueTokens(User u) {
        String access = jwtUtil.generateAccessToken(u.getId(), u.getEmail(), u.getRole());
        String refresh = jwtUtil.generateRefreshToken(u.getId());

        RefreshToken rt = new RefreshToken();
        rt.setUserId(u.getId());
        rt.setToken(refresh);
        rt.setExpiresAt(LocalDateTime.now().plusNanos(jwtUtil.getRefreshTokenValidityMs() * 1_000_000));
        refreshTokenMapper.insert(rt);

        return new TokenResponse(
                access, refresh,
                jwtUtil.getAccessTokenValidityMs(),
                u.getId(), u.getEmail(), u.getUsername(), u.getRole());
    }
}

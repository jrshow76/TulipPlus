package com.tulipplus.auth.controller;

import com.tulipplus.auth.common.ApiResponse;
import com.tulipplus.auth.dto.LoginRequest;
import com.tulipplus.auth.dto.RefreshRequest;
import com.tulipplus.auth.dto.RegisterRequest;
import com.tulipplus.auth.dto.TokenResponse;
import com.tulipplus.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(@Valid @RequestBody RegisterRequest req) {
        TokenResponse token = authService.register(req);
        return ResponseEntity.ok(ApiResponse.ok(token, "회원가입이 완료되었습니다."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest req) {
        TokenResponse token = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok(token, "로그인 성공"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest req) {
        TokenResponse token = authService.refresh(req.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok(token, "토큰 갱신 성공"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshRequest req) {
        String token = (req == null) ? null : req.getRefreshToken();
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.ok(null, "로그아웃 되었습니다."));
    }
}

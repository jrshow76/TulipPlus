package com.tulipplus.user.controller;

import com.tulipplus.user.common.ApiResponse;
import com.tulipplus.user.domain.UserProfile;
import com.tulipplus.user.dto.ChangePasswordRequest;
import com.tulipplus.user.dto.UpdateProfileRequest;
import com.tulipplus.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> getMe(Authentication auth) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        return ResponseEntity.ok(ApiResponse.ok(userService.getMyProfile(userId)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> updateMe(Authentication auth,
                                                             @Valid @RequestBody UpdateProfileRequest req) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        UserProfile updated = userService.updateMyProfile(userId, req);
        return ResponseEntity.ok(ApiResponse.ok(updated, "프로필이 업데이트되었습니다."));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication auth,
                                                            @Valid @RequestBody ChangePasswordRequest req) {
        Long userId = Long.parseLong((String) auth.getPrincipal());
        userService.changePassword(userId, req);
        return ResponseEntity.ok(ApiResponse.ok(null, "비밀번호가 변경되었습니다."));
    }
}

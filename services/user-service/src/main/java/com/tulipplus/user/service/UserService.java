package com.tulipplus.user.service;

import com.tulipplus.user.common.BusinessException;
import com.tulipplus.user.domain.UserProfile;
import com.tulipplus.user.dto.ChangePasswordRequest;
import com.tulipplus.user.dto.UpdateProfileRequest;
import com.tulipplus.user.mapper.UserProfileMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserProfileMapper mapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserProfileMapper mapper, PasswordEncoder passwordEncoder) {
        this.mapper = mapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfile getMyProfile(Long userId) {
        UserProfile p = mapper.findByUserId(userId);
        if (p == null) {
            throw new BusinessException("PROFILE_NOT_FOUND", "프로필을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        return p;
    }

    @Transactional
    public UserProfile updateMyProfile(Long userId, UpdateProfileRequest req) {
        UserProfile current = mapper.findByUserId(userId);
        if (current == null) {
            throw new BusinessException("PROFILE_NOT_FOUND", "프로필을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }

        if (req.getUsername() != null && !req.getUsername().equals(current.getUsername())) {
            if (mapper.existsUsername(req.getUsername(), userId) > 0) {
                throw new BusinessException("USERNAME_EXISTS", "이미 사용 중인 사용자명입니다.", HttpStatus.CONFLICT);
            }
            mapper.updateUsername(userId, req.getUsername());
        }

        mapper.updateProfile(
                userId,
                req.getFullName() != null ? req.getFullName() : current.getFullName(),
                req.getPhone()    != null ? req.getPhone()    : current.getPhone(),
                req.getBio()      != null ? req.getBio()      : current.getBio(),
                req.getAvatarUrl()!= null ? req.getAvatarUrl(): current.getAvatarUrl()
        );

        return mapper.findByUserId(userId);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest req) {
        String currentHash = mapper.findPasswordById(userId);
        if (currentHash == null) {
            throw new BusinessException("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        if (!passwordEncoder.matches(req.getCurrentPassword(), currentHash)) {
            throw new BusinessException("PASSWORD_MISMATCH", "현재 비밀번호가 일치하지 않습니다.", HttpStatus.BAD_REQUEST);
        }
        if (passwordEncoder.matches(req.getNewPassword(), currentHash)) {
            throw new BusinessException("PASSWORD_SAME", "새 비밀번호가 기존 비밀번호와 동일합니다.", HttpStatus.BAD_REQUEST);
        }
        mapper.updatePassword(userId, passwordEncoder.encode(req.getNewPassword()));
    }
}

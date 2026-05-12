package com.tulipplus.user.mapper;

import com.tulipplus.user.domain.UserProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserProfileMapper {
    UserProfile findByUserId(@Param("userId") Long userId);

    int updateProfile(@Param("userId") Long userId,
                      @Param("fullName") String fullName,
                      @Param("phone") String phone,
                      @Param("bio") String bio,
                      @Param("avatarUrl") String avatarUrl);

    int updateUsername(@Param("userId") Long userId,
                       @Param("username") String username);

    String findPasswordById(@Param("userId") Long userId);

    int updatePassword(@Param("userId") Long userId,
                       @Param("password") String password);

    int existsUsername(@Param("username") String username,
                       @Param("excludeUserId") Long excludeUserId);
}

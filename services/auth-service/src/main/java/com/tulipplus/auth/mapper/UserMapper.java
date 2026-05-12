package com.tulipplus.auth.mapper;

import com.tulipplus.auth.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User findByEmail(@Param("email") String email);
    User findByUsername(@Param("username") String username);
    User findById(@Param("id") Long id);
    int insertUser(User user);
    int updateLastLogin(@Param("id") Long id);
    int existsByEmail(@Param("email") String email);
    int existsByUsername(@Param("username") String username);
    int insertProfile(@Param("userId") Long userId,
                      @Param("fullName") String fullName,
                      @Param("phone") String phone);
}

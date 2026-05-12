package com.tulipplus.auth.mapper;

import com.tulipplus.auth.domain.RefreshToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface RefreshTokenMapper {
    int insert(RefreshToken rt);
    RefreshToken findByToken(@Param("token") String token);
    int deleteByToken(@Param("token") String token);
    int deleteByUserId(@Param("userId") Long userId);
}

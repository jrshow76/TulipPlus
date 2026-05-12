package com.tulipplus.user.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    private Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true; r.data = data; r.message = "OK";
        return r;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true; r.data = data; r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false; r.errorCode = code; r.message = message;
        return r;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public String getErrorCode() { return errorCode; }
    public Instant getTimestamp() { return timestamp; }
    public void setSuccess(boolean v) { this.success = v; }
    public void setMessage(String v) { this.message = v; }
    public void setData(T v) { this.data = v; }
    public void setErrorCode(String v) { this.errorCode = v; }
    public void setTimestamp(Instant v) { this.timestamp = v; }
}

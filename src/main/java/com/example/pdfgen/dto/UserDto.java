package com.example.pdfgen.dto;

import java.time.Instant;

public class UserDto {
    private Long id;
    private String phone;
    private String name;
    private Instant createdAt;

    public UserDto() {}

    public UserDto(Long id, String phone, String name, Instant createdAt) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

package com.example.pdfgen.dto;

import java.time.Instant;

public class DownloadDto {
    private Long id;
    private String phone;
    private String name;
    private String rationNumber;
    private String dateInfo;
    private String resourceType;
    private String clientIp;
    private Instant downloadedAt;

    public DownloadDto() {}

    public DownloadDto(Long id, String phone, String name, String rationNumber, String dateInfo,
                       String resourceType, String clientIp, Instant downloadedAt) {
        this.id = id;
        this.phone = phone;
        this.name = name;
        this.rationNumber = rationNumber;
        this.dateInfo = dateInfo;
        this.resourceType = resourceType;
        this.clientIp = clientIp;
        this.downloadedAt = downloadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Backward-compatible alias for frontend
    public String getUserName() { return name; }
    public void setUserName(String name) { this.name = name; }

    public String getRationNumber() { return rationNumber; }
    public void setRationNumber(String rationNumber) { this.rationNumber = rationNumber; }

    public String getDateInfo() { return dateInfo; }
    public void setDateInfo(String dateInfo) { this.dateInfo = dateInfo; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public Instant getDownloadedAt() { return downloadedAt; }
    public void setDownloadedAt(Instant downloadedAt) { this.downloadedAt = downloadedAt; }
}

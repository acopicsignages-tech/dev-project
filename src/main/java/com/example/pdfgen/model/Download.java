package com.example.pdfgen.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "downloads")
public class Download {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "downloaded_at", nullable = false, updatable = false)
    private Instant downloadedAt = Instant.now();

    @Column(name = "client_ip")
    private String clientIp;

    @Column(name = "name")
    private String name;

    @Column(name = "ration_number")
    private String rationNumber;

    @Column(name = "date_info")
    private String dateInfo;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public Instant getDownloadedAt() { return downloadedAt; }
    public void setDownloadedAt(Instant downloadedAt) { this.downloadedAt = downloadedAt; }
    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRationNumber() { return rationNumber; }
    public void setRationNumber(String rationNumber) { this.rationNumber = rationNumber; }
    public String getDateInfo() { return dateInfo; }
    public void setDateInfo(String dateInfo) { this.dateInfo = dateInfo; }
}

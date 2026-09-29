package com.example.pdfgen.controller;

import com.example.pdfgen.dto.DownloadDto;
import com.example.pdfgen.dto.UserDto;
import com.example.pdfgen.model.Download;
import com.example.pdfgen.model.User;
import com.example.pdfgen.repository.DownloadRepository;
import com.example.pdfgen.repository.UserRepository;
import com.example.pdfgen.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    private static final DateTimeFormatter CSV_DATE_FMT = 
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.of("Asia/Kolkata"));

    private final UserRepository userRepository;
    private final DownloadRepository downloadRepository;
    private final UserSessionRepository sessionRepository;

    @Value("${admin.pin:admin123}")
    private String adminPin;

    public AdminController(UserRepository userRepository,
                           DownloadRepository downloadRepository,
                           UserSessionRepository sessionRepository) {
        this.userRepository = userRepository;
        this.downloadRepository = downloadRepository;
        this.sessionRepository = sessionRepository;
    }

    private boolean isAuthorized(HttpServletRequest request) {
        String pinHeader = request.getHeader("X-Admin-Pin");
        if (pinHeader != null && pinHeader.trim().equals(adminPin.trim())) {
            return true;
        }
        String pinParam = request.getParameter("pin");
        return pinParam != null && pinParam.trim().equals(adminPin.trim());
    }

    /**
     * Verify Admin PIN
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyAdmin(@RequestBody(required = false) Map<String, String> body) {
        String pin = body == null ? null : body.get("pin");
        if (pin != null && pin.trim().equals(adminPin.trim())) {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Admin verified successfully"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", "Invalid Admin PIN."));
    }

    /**
     * List all allowed users (phone numbers)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        if (!isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<UserDto> users = userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(u -> new UserDto(u.getId(), u.getPhone(), u.getName(), u.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(users);
    }

    /**
     * Add a new allowed phone number
     */
    @PostMapping("/users")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> body, HttpServletRequest request) {
        if (!isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String rawPhone = body.get("phone");
        String name = body.get("name");

        if (rawPhone == null || rawPhone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required."));
        }

        String phone = rawPhone.replaceAll("\\D", "");
        if (phone.length() != 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid 10-digit mobile number."));
        }

        if (userRepository.existsByPhone(phone)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Phone number " + phone + " is already registered in the whitelist."));
        }

        User user = new User();
        user.setPhone(phone);
        user.setName(name != null && !name.isBlank() ? name.trim() : null);
        user.setCreatedAt(Instant.now());

        User saved = userRepository.save(user);
        log.info("Admin added user id={} phone={}", saved.getId(), saved.getPhone());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UserDto(saved.getId(), saved.getPhone(), saved.getName(), saved.getCreatedAt()));
    }

    /**
     * Remove / Revoke an allowed user
     */
    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, HttpServletRequest request) {
        if (!isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        return userRepository.findById(id).map(user -> {
            sessionRepository.deleteByUserId(id);
            downloadRepository.deleteByUserId(id);
            userRepository.delete(user);
            log.info("Admin deleted user id={} phone={}", id, user.getPhone());
            return ResponseEntity.ok(Map.of("message", "User " + user.getPhone() + " deleted successfully."));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found.")));
    }

    /**
     * Stream CSV export of whitelist users directly to the client browser
     */
    @GetMapping("/users/export")
    public void exportUsersCsv(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAuthorized(request)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        String filename = "gruhalakshmi_whitelisted_users_" + LocalDate.now() + ".csv";
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();

        try (PrintWriter writer = response.getWriter()) {
            writer.write('\ufeff'); // UTF-8 BOM for Excel
            writer.println("User ID,Phone Number,Beneficiary Name,Registered Date (IST)");

            for (User u : users) {
                String formattedDate = u.getCreatedAt() != null ? CSV_DATE_FMT.format(u.getCreatedAt()) : "";
                writer.printf("%d,\"%s\",\"%s\",\"%s\"%n",
                        u.getId(),
                        escapeCsv(u.getPhone()),
                        escapeCsv(u.getName() != null ? u.getName() : ""),
                        escapeCsv(formattedDate)
                );
            }
            writer.flush();
        }
    }

    /**
     * Fetch list of all downloads for admin dashboard
     */
    @GetMapping("/downloads")
    public ResponseEntity<?> getDownloads(HttpServletRequest request) {
        if (!isAuthorized(request)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<Download> downloads = downloadRepository.findAllWithUser();
        List<DownloadDto> dtoList = downloads.stream().map(d -> {
            String phone = d.getUser() != null ? d.getUser().getPhone() : "N/A";
            String name = d.getName() != null && !d.getName().isBlank()
                    ? d.getName()
                    : (d.getUser() != null && d.getUser().getName() != null ? d.getUser().getName() : "");
            return new DownloadDto(
                    d.getId(),
                    phone,
                    name,
                    d.getRationNumber() != null ? d.getRationNumber() : "",
                    d.getDateInfo() != null ? d.getDateInfo() : "",
                    d.getResourceType(),
                    d.getClientIp(),
                    d.getDownloadedAt()
            );
        }).toList();

        return ResponseEntity.ok(dtoList);
    }

    /**
     * Stream CSV export of all downloads directly to the client browser
     */
    @GetMapping("/downloads/export")
    public void exportDownloadsCsv(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!isAuthorized(request)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            return;
        }

        String filename = "gruhalakshmi_downloads_" + LocalDate.now() + ".csv";
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

        List<Download> downloads = downloadRepository.findAllWithUser();

        try (PrintWriter writer = response.getWriter()) {
            writer.write('\ufeff'); // UTF-8 BOM for Excel
            writer.println("Download ID,User Phone,Beneficiary Name,Ration Card Number,Date Info,Resource Type,Client IP,Downloaded At (IST)");

            for (Download d : downloads) {
                String phone = d.getUser() != null ? d.getUser().getPhone() : "Unknown";
                String name = d.getName() != null && !d.getName().isBlank()
                        ? d.getName()
                        : (d.getUser() != null && d.getUser().getName() != null ? d.getUser().getName() : "");
                String rationNumber = d.getRationNumber() != null ? d.getRationNumber() : "";
                String dateInfo = d.getDateInfo() != null ? d.getDateInfo() : "";
                String formattedDate = d.getDownloadedAt() != null ? CSV_DATE_FMT.format(d.getDownloadedAt()) : "";

                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        d.getId(),
                        escapeCsv(phone),
                        escapeCsv(name),
                        escapeCsv(rationNumber),
                        escapeCsv(dateInfo),
                        escapeCsv(d.getResourceType()),
                        escapeCsv(d.getClientIp() != null ? d.getClientIp() : ""),
                        escapeCsv(formattedDate)
                );
            }
            writer.flush();
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}

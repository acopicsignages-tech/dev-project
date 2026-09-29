package com.example.pdfgen.controller;

import com.example.pdfgen.dto.PdfRequest;
import com.example.pdfgen.model.Download;
import com.example.pdfgen.model.User;
import com.example.pdfgen.repository.DownloadRepository;
import com.example.pdfgen.repository.UserRepository;
import com.example.pdfgen.service.AuthService;
import com.example.pdfgen.service.PdfService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "*")
public class PdfController {

    private static final Logger log = LoggerFactory.getLogger(PdfController.class);

    private final PdfService pdfService;
    private final AuthService authService;
    private final DownloadRepository downloadRepository;
    private final UserRepository userRepository;

    public PdfController(PdfService pdfService,
                         AuthService authService,
                         DownloadRepository downloadRepository,
                         UserRepository userRepository) {
        this.pdfService = pdfService;
        this.authService = authService;
        this.downloadRepository = downloadRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/template-defaults")
    public ResponseEntity<Map<String, String>> getTemplateDefaults() {
        return ResponseEntity.ok(Map.of(
                "date", "2023-07-21",
                "displayDate", "21-07-2023",
                "rationCardNumber", "240100159730",
                "name", "ಶಿವಮ್ಮ"
        ));
    }

    /**
     * Generate and download a PDF from the Gruha Lakshmi template.
     * Records the download in the downloads database table.
     */
    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(
            @RequestBody PdfRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest) {
        try {
            byte[] pdfBytes = pdfService.generatePdf(request);

            // Record download in database
            recordDownload(request, authHeader, httpRequest);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"gruhalakshmi-sanction-order.pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("PDF generation failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private void recordDownload(PdfRequest request, String authHeader, HttpServletRequest httpRequest) {
        try {
            User user = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7).trim();
                user = authService.validateToken(token).orElse(null);
            }
            if (user == null) {
                user = userRepository.findAll().stream().findFirst().orElse(null);
            }
            if (user != null) {
                Download download = new Download();
                download.setUser(user);
                if (request != null) {
                    download.setName(request.getName());
                    download.setRationNumber(request.getRationCardNumber());
                    download.setDateInfo(request.getDate());
                }
                download.setResourceType("PDF_SANCTION_ORDER");
                download.setDownloadedAt(Instant.now());
                if (httpRequest != null) {
                    String ip = httpRequest.getHeader("X-Forwarded-For");
                    if (ip == null || ip.isBlank()) {
                        ip = httpRequest.getRemoteAddr();
                    }
                    download.setClientIp(ip);
                }
                downloadRepository.save(download);
                log.info("Download saved to database: id={}, userId={}, phone={}, name={}, ration={}",
                        download.getId(), user.getId(), user.getPhone(), download.getName(), download.getRationNumber());
            } else {
                log.warn("Download record skipped: No user found in database or session.");
            }
        } catch (Exception ex) {
            log.error("Failed to save download record to database", ex);
        }
    }
}

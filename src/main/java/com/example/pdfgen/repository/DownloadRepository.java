package com.example.pdfgen.repository;

import com.example.pdfgen.model.Download;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Long> {
    List<Download> findByUserId(Long userId);
    void deleteByUserId(Long userId);

    @Query("SELECT d FROM Download d LEFT JOIN FETCH d.user ORDER BY d.downloadedAt DESC")
    List<Download> findAllWithUser();
}

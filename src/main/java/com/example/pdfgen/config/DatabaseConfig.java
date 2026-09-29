package com.example.pdfgen.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/phone_download}")
    private String dbUrl;

    @Value("${spring.datasource.username:shruthi}")
    private String dbUsername;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        try {
            // Support cloud platform connection strings (e.g. Render, Railway: postgres://user:pass@host:port/db)
            if (dbUrl.startsWith("postgres://") || (dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("jdbc:"))) {
                URI uri = new URI(dbUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + (query != null ? "?" + query : "");

                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                } else {
                    config.setUsername(dbUsername);
                    config.setPassword(dbPassword);
                }
                log.info("Configured Cloud PostgreSQL DataSource for host: {}", host);
            } else {
                config.setJdbcUrl(dbUrl);
                config.setUsername(dbUsername);
                config.setPassword(dbPassword);
            }
        } catch (Exception e) {
            log.warn("Falling back to direct datasource properties: {}", e.getMessage());
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUsername);
            config.setPassword(dbPassword);
        }

        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            log.info("Repairing Flyway schema history...");
            flyway.repair();
            log.info("Applying Flyway migrations...");
            flyway.migrate();
        };
    }
}


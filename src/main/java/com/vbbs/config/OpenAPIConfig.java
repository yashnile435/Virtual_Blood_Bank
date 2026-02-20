package com.vbbs.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI virtualBloodBankOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("Virtual Blood Banking System API")
                        .description("API Documentation for VBBS")
                        .version("v1.0"));
    }
}

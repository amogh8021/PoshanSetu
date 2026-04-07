package com.poshansetu.integration;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number:+1234567890}")
    private String fromPhoneNumber;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.contains("<") && authToken != null && !authToken.contains("<")) {
            Twilio.init(accountSid, authToken);
            log.info("Twilio initialized successfully");
        } else {
            log.warn("Twilio credentials not configured properly");
        }
    }

    public void send(String phone, String text) {
        try {
            log.info("Sending SMS to {}: {}", phone, text);
            if (accountSid != null && !accountSid.contains("<")) {
                Message.creator(
                        new PhoneNumber(phone),
                        new PhoneNumber(fromPhoneNumber),
                        text
                ).create();
            } else {
                log.warn("Skipped sending SMS due to missing Twilio credentials");
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phone, e.getMessage());
        }
    }
}

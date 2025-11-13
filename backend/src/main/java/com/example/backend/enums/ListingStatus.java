package com.example.backend.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ListingStatus {
    SENT_FRESH("SENT FRESH"),
    SENT_FROZEN("SENT FROZEN"),
    UNSENT_FRESH("UNSENT FRESH"),
    AVAILABLE("AVAILABLE"),
    SOLD("SOLD");

    private final String dbValue;

    ListingStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }
}
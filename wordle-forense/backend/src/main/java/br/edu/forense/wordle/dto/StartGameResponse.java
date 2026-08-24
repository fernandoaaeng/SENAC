package br.edu.forense.wordle.dto;

import java.time.Instant;

public record StartGameResponse(Long id, String status, Instant startedAt) {}

package br.edu.forense.wordle.dto;

import br.edu.forense.wordle.entity.GameSession;

import java.time.Instant;

public record SessionSummaryResponse(Long id, String status, Instant startedAt, Instant finishedAt) {

    public static SessionSummaryResponse from(GameSession session) {
        return new SessionSummaryResponse(
                session.getId(),
                session.getStatus(),
                session.getStartedAt(),
                session.getFinishedAt()
        );
    }
}

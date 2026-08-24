package br.edu.forense.wordle.dto;

import br.edu.forense.wordle.entity.Attempt;
import br.edu.forense.wordle.entity.GameSession;

import java.time.Instant;
import java.util.List;

public record SessionDetailResponse(
        Long id,
        Long userId,
        String username,
        String status,
        Instant startedAt,
        Instant finishedAt,
        String targetWord,
        List<AttemptView> attempts
) {
    public static SessionDetailResponse from(GameSession session, List<Attempt> attempts) {
        return new SessionDetailResponse(
                session.getId(),
                session.getUser().getId(),
                session.getUser().getUsername(),
                session.getStatus(),
                session.getStartedAt(),
                session.getFinishedAt(),
                session.getWord().getWord(),
                attempts.stream().map(AttemptView::from).toList()
        );
    }

    public record AttemptView(Long id, String guess, String result, Integer attemptNumber, Instant createdAt) {
        static AttemptView from(Attempt attempt) {
            return new AttemptView(
                    attempt.getId(),
                    attempt.getGuess(),
                    attempt.getResult(),
                    attempt.getAttemptNumber(),
                    attempt.getCreatedAt()
            );
        }
    }
}

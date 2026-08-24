package br.edu.forense.wordle.service;

import br.edu.forense.wordle.dto.GuessRequest;
import br.edu.forense.wordle.dto.GuessResponse;
import br.edu.forense.wordle.dto.SessionDetailResponse;
import br.edu.forense.wordle.dto.SessionSummaryResponse;
import br.edu.forense.wordle.dto.StartGameResponse;
import br.edu.forense.wordle.entity.Attempt;
import br.edu.forense.wordle.entity.GameSession;
import br.edu.forense.wordle.entity.User;
import br.edu.forense.wordle.entity.Word;
import br.edu.forense.wordle.exception.ApiException;
import br.edu.forense.wordle.game.WordleEvaluator;
import br.edu.forense.wordle.repository.AttemptRepository;
import br.edu.forense.wordle.repository.GameSessionRepository;
import br.edu.forense.wordle.repository.UserRepository;
import br.edu.forense.wordle.repository.WordRepository;
import br.edu.forense.wordle.security.TokenUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@ApplicationScoped
@RequiredArgsConstructor
public class GameService {

    private static final Logger LOG = Logger.getLogger(GameService.class);
    private static final int MAX_ATTEMPTS = 6;

    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private final GameSessionRepository sessionRepository;
    private final AttemptRepository attemptRepository;

    @Transactional
    public StartGameResponse start(TokenUtil.Principal principal) {
        User user = userRepository.findById(principal.userId());
        if (user == null) {
            throw ApiException.unauthorized("usuario do token nao existe");
        }
        List<Word> words = wordRepository.listActive();
        if (words.isEmpty()) {
            throw ApiException.badRequest("nenhuma palavra ativa");
        }
        Word word = words.get(ThreadLocalRandom.current().nextInt(words.size()));

        GameSession session = new GameSession();
        session.setUser(user);
        session.setWord(word);
        session.setStatus("IN_PROGRESS");
        session.setStartedAt(Instant.now());
        sessionRepository.persist(session);

        return new StartGameResponse(session.getId(), session.getStatus(), session.getStartedAt());
    }

    /**
     * CONTRASTE com V2: este método CHECA o dono da sessão.
     */
    @Transactional
    public GuessResponse guess(TokenUtil.Principal principal, Long sessionId, GuessRequest req) {
        GameSession session = sessionRepository.findByIdOptional(sessionId)
                .orElseThrow(NotFoundException::new);

        if (!session.getUser().getId().equals(principal.userId())) {
            LOG.infof("guess recusado: user %s nao e dono da sessao %s", principal.userId(), sessionId);
            throw ApiException.forbidden("sessao de outro usuario");
        }
        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw ApiException.badRequest("sessao ja encerrada");
        }

        long count = attemptRepository.countBySession(session);
        if (count >= MAX_ATTEMPTS) {
            throw ApiException.badRequest("limite de tentativas");
        }

        String guess = req.guess().toUpperCase();
        String result = WordleEvaluator.evaluate(session.getWord().getWord(), guess);

        Attempt attempt = new Attempt();
        attempt.setGameSession(session);
        attempt.setGuess(guess);
        attempt.setResult(result);
        attempt.setAttemptNumber((int) count + 1);
        attempt.setCreatedAt(Instant.now());
        attemptRepository.persist(attempt);

        if ("GGGGG".equals(result)) {
            session.setStatus("WON");
            session.setFinishedAt(Instant.now());
        } else if (attempt.getAttemptNumber() >= MAX_ATTEMPTS) {
            session.setStatus("LOST");
            session.setFinishedAt(Instant.now());
        }

        return new GuessResponse(attempt.getAttemptNumber(), guess, result, session.getStatus());
    }

    /**
     * V2 — IDOR: devolve a sessão COMPLETA (inclusive a palavra-alvo) pelo ID
     * sequencial, SEM checar se o userId do token é o dono.
     */
    @Transactional
    public SessionDetailResponse getSession(Long sessionId) {
        GameSession session = sessionRepository.findByIdOptional(sessionId)
                .orElseThrow(NotFoundException::new);
        LOG.debugf("V2 GET sessao %s sem checagem de dono (user dono=%s)", sessionId, session.getUser().getId());
        return SessionDetailResponse.from(session, attemptRepository.listBySession(session));
    }

    @Transactional
    public List<SessionSummaryResponse> listMine(TokenUtil.Principal principal) {
        return sessionRepository.listByUserId(principal.userId()).stream()
                .map(SessionSummaryResponse::from)
                .toList();
    }
}

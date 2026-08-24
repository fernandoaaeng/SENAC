package br.edu.forense.wordle.repository;

import br.edu.forense.wordle.entity.Attempt;
import br.edu.forense.wordle.entity.GameSession;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AttemptRepository implements PanacheRepository<Attempt> {

    public long countBySession(GameSession session) {
        return count("session", session);
    }

    public List<Attempt> listBySession(GameSession session) {
        return list("session", session);
    }
}

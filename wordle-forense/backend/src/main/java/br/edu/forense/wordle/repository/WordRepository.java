package br.edu.forense.wordle.repository;

import br.edu.forense.wordle.entity.Word;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class WordRepository implements PanacheRepository<Word> {

    public List<Word> listActive() {
        return list("active", true);
    }
}

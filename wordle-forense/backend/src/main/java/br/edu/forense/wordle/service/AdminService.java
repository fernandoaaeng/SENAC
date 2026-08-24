package br.edu.forense.wordle.service;

import br.edu.forense.wordle.dto.ActiveWordResponse;
import br.edu.forense.wordle.dto.UserPublicResponse;
import br.edu.forense.wordle.dto.WordRequest;
import br.edu.forense.wordle.dto.WordResponse;
import br.edu.forense.wordle.entity.Word;
import br.edu.forense.wordle.repository.UserRepository;
import br.edu.forense.wordle.repository.WordRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
@RequiredArgsConstructor
public class AdminService {

    private static final Logger LOG = Logger.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final WordRepository wordRepository;

    @Transactional
    public List<UserPublicResponse> listUsers() {
        LOG.info("V3 GET /api/admin/users — autorizado só pela role do token");
        return userRepository.listAll().stream().map(UserPublicResponse::from).toList();
    }

    @Transactional
    public List<WordResponse> listWords() {
        return wordRepository.listAll().stream().map(WordResponse::from).toList();
    }

    @Transactional
    public List<ActiveWordResponse> listActiveWords() {
        return wordRepository.listActive().stream().map(ActiveWordResponse::from).toList();
    }

    @Transactional
    public WordResponse createWord(WordRequest req) {
        Word word = new Word();
        word.setWord(req.word() == null ? "" : req.word().toUpperCase());
        word.setDifficulty(req.difficulty() == null ? "MEDIO" : req.difficulty());
        word.setActive(req.active() == null || req.active());
        wordRepository.persist(word);
        return WordResponse.from(word);
    }

    @Transactional
    public WordResponse updateWord(Long id, WordRequest req) {
        Word word = wordRepository.findByIdOptional(id).orElseThrow(NotFoundException::new);
        if (req.word() != null) {
            word.setWord(req.word().toUpperCase());
        }
        if (req.difficulty() != null) {
            word.setDifficulty(req.difficulty());
        }
        if (req.active() != null) {
            word.setActive(req.active());
        }
        return WordResponse.from(word);
    }

    @Transactional
    public void deleteWord(Long id) {
        Word word = wordRepository.findByIdOptional(id).orElseThrow(NotFoundException::new);
        wordRepository.delete(word);
    }
}

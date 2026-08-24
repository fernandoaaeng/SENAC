package br.edu.forense.wordle.service;

import br.edu.forense.wordle.dto.UserPublicResponse;
import br.edu.forense.wordle.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.jboss.logging.Logger;

@ApplicationScoped
@RequiredArgsConstructor
public class UserService {

    private static final Logger LOG = Logger.getLogger(UserService.class);

    private final UserRepository userRepository;

    /**
     * V4 — IDOR: devolve perfil de qualquer id sequencial, sem checar se é o próprio
     * usuário ou admin. Permite enumerar /api/users/1, /2, /3...
     */
    @Transactional
    public UserPublicResponse byId(Long id) {
        LOG.debugf("V4 GET /api/users/%s sem checagem de identidade", id);
        return userRepository.findByIdOptional(id)
                .map(UserPublicResponse::from)
                .orElseThrow(NotFoundException::new);
    }
}

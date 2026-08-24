package br.edu.forense.wordle.service;

import br.edu.forense.wordle.dto.LoginRequest;
import br.edu.forense.wordle.dto.LoginResponse;
import br.edu.forense.wordle.exception.ApiException;
import br.edu.forense.wordle.security.TokenUtil;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);

    @Inject
    EntityManager em;

    /**
     * V1 — SQL Injection (bypass de autenticação).
     *
     * A query é montada por CONCATENAÇÃO. Payload clássico:
     *   username = admin' --
     *   username = ' OR '1'='1
     *
     * Versão corrigida (NÃO usada aqui de propósito):
     *   userRepository.find("username = ?1 and password = ?2", req.username(), req.password()).firstResult();
     * ou native query com parâmetros nomeados:
     *   em.createNativeQuery("SELECT ... WHERE username = :u AND password = :p")
     *     .setParameter("u", req.username()).setParameter("p", req.password());
     *
     * Rastro forense: quarkus.hibernate-orm.log.sql + log_statement=all no Postgres.
     */
    @Transactional
    public LoginResponse login(LoginRequest req) {
        String sql = "SELECT id, username, password, role FROM users WHERE username = '"
                + req.username() + "' AND password = '" + req.password() + "'";

        LOG.debugf("V1 login SQL concatenada: %s", sql);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();
        if (rows.isEmpty()) {
            throw ApiException.unauthorized("credenciais invalidas");
        }

        Object[] row = rows.get(0);
        Long id = ((Number) row[0]).longValue();
        String username = (String) row[1];
        String role = (String) row[3];
        return new LoginResponse(TokenUtil.issue(id, username, role), id, username, role);
    }
}

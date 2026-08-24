package br.edu.forense.wordle.security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * V3 — Token NÃO assinado (não é JWT).
 *
 * Formato: Base64("userId:username:role")
 *
 * Causa raiz do escalonamento de privilégio: o cliente controla o conteúdo do token
 * (incluindo a role) e o backend CONFIA nela sem reconsultar o banco e sem assinatura.
 *
 * Correção correta:
 * (a) emitir JWT de verdade (assinado), ex. quarkus-oidc / smallrye-jwt; e/ou
 * (b) sempre recarregar a role no banco a partir do userId — nunca aceitar a role
 *     que veio no próprio token/request.
 *
 * Exploração em aula: atob(token) → trocar USER por ADMIN → btoa(...) → Authorization.
 */
public final class TokenUtil {

    public record Principal(Long userId, String username, String role) {}

    private TokenUtil() {}

    public static String issue(Long userId, String username, String role) {
        String raw = userId + ":" + username + ":" + role;
        return Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public static Optional<Principal> parse(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return Optional.empty();
        }
        String value = authorizationHeader;
        if (value.regionMatches(true, 0, "Bearer ", 0, 7)) {
            value = value.substring(7).trim();
        }
        try {
            String decoded = new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
            String[] parts = decoded.split(":", 3);
            if (parts.length != 3) {
                return Optional.empty();
            }
            return Optional.of(new Principal(Long.parseLong(parts[0]), parts[1], parts[2]));
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }
}

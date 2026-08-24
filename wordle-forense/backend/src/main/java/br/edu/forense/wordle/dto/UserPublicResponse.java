package br.edu.forense.wordle.dto;

import br.edu.forense.wordle.entity.User;

public record UserPublicResponse(Long id, String username, String email, String role) {

    public static UserPublicResponse from(User user) {
        return new UserPublicResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}

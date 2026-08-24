package br.edu.forense.wordle.dto;

import br.edu.forense.wordle.entity.Word;

public record ActiveWordResponse(Long id, String difficulty, int length) {

    public static ActiveWordResponse from(Word word) {
        return new ActiveWordResponse(word.getId(), word.getDifficulty(), 5);
    }
}

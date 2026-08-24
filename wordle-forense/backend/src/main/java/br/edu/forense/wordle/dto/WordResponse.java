package br.edu.forense.wordle.dto;

import br.edu.forense.wordle.entity.Word;

public record WordResponse(Long id, String word, String difficulty, Boolean active) {

    public static WordResponse from(Word word) {
        return new WordResponse(word.getId(), word.getWord(), word.getDifficulty(), word.getActive());
    }
}

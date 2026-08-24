package br.edu.forense.wordle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GuessRequest(
        @NotBlank @Size(min = 5, max = 5) String guess
) {}

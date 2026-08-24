package br.edu.forense.wordle.dto;

public record GuessResponse(int attemptNumber, String guess, String result, String status) {}

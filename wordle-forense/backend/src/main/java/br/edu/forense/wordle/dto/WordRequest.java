package br.edu.forense.wordle.dto;

public record WordRequest(String word, String difficulty, Boolean active) {}

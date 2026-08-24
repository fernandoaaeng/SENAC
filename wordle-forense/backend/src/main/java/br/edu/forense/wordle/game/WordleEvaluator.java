package br.edu.forense.wordle.game;

public final class WordleEvaluator {

    private WordleEvaluator() {}

    /**
     * G = posição correta, Y = letra existe em outra posição, X = ausente.
     * Trata letras duplicadas no estilo Wordle (marca greens primeiro).
     */
    public static String evaluate(String target, String guess) {
        char[] t = target.toUpperCase().toCharArray();
        char[] g = guess.toUpperCase().toCharArray();
        char[] result = new char[5];
        boolean[] used = new boolean[5];

        for (int i = 0; i < 5; i++) {
            if (g[i] == t[i]) {
                result[i] = 'G';
                used[i] = true;
            }
        }
        for (int i = 0; i < 5; i++) {
            if (result[i] == 'G') {
                continue;
            }
            boolean found = false;
            for (int j = 0; j < 5; j++) {
                if (!used[j] && g[i] == t[j]) {
                    used[j] = true;
                    found = true;
                    break;
                }
            }
            result[i] = found ? 'Y' : 'X';
        }
        return new String(result);
    }
}

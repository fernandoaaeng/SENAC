/** Só palavras com exatamente 5 letras, português sem acento. */
export const PALAVRAS_PT5: readonly string[] = [
  'CASAS', 'LIVRO', 'PRAIA', 'MUNDO', 'FELIZ', 'JOGAR', 'TEMPO', 'NOITE', 'VERDE', 'FORTE',
  'PLANO', 'TERRA', 'VENTO', 'PEDRA', 'SONHO', 'GENTE', 'PODER', 'FALAR', 'OLHAR', 'LINHA',
  'CAMPO', 'AMIGO', 'CARRO', 'PORTA', 'AGORA', 'TARDE', 'NUNCA', 'OUTRO', 'MESMO', 'TODOS',
  'NOSSO', 'DEIXA', 'SABER', 'VIVER', 'CORPO', 'MENTE', 'HORAS', 'SAUDE', 'VISAO', 'IDEIA',
  'PAPEL', 'PEDIR', 'FESTA', 'PONTO', 'LEITE', 'CARNE', 'FRUTA', 'FOLHA', 'CLARO', 'CERTO',
  'JUSTO', 'LONGE', 'PERTO', 'BAIXO', 'NORTE', 'OESTE', 'LESTE', 'COSTA', 'PRAZO', 'PRECO',
  'VALOR', 'LUGAR', 'PARTE', 'GRUPO', 'FORMA', 'CINZA', 'AGUAS', 'ARROZ', 'LIMAO', 'MELAO',
  'BEBER', 'COMER', 'ANDAR', 'MORAR', 'AMIGA', 'HOMEM', 'PROVA', 'NOTAS', 'LAPIS', 'CHUVA',
  'NUVEM', 'SOLAR', 'LUNAR', 'MARCA', 'CHAVE', 'DENTE', 'PEIXE', 'BARCO', 'NAVIO', 'FLORA',
  'BANCO', 'MOEDA', 'PRIMO', 'IRMAO', 'FILHO', 'FILHA', 'GOSTO', 'AMADO', 'PULAR', 'SULCO',
];

export function sugestoesPt5(prefixo: string, limite = 8): string[] {
  const p = prefixo.toUpperCase().replace(/[^A-Z]/g, '');
  return PALAVRAS_PT5.filter((w) => w.length === 5 && (p.length === 0 || w.startsWith(p))).slice(0, limite);
}

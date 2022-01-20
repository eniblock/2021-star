export interface FormulairePagination<E> {
  // E => enum indiquant le nom du champ sur lequel on trie
  pagesize: number;
  bookmark: string | null; // Bookmark de la precedente requete dans le cas où on veut la page suivante (null si on veut la première page)
  order: E | null;
}

export interface PaginationReponse<E> {
  totalElements: number; // Le nombre total d'éléments
  bookmark: string; // Bookmark de la requète envoyée à la blockchain (utile pour la pagination)
  content: E[]; // Les resultats
}

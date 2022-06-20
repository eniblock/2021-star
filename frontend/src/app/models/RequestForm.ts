import { OrderDirection } from './enum/OrderDirection.enum';

export interface RequestForm<E> {
  // E => enum indiquant le nom du champ sur lequel on trie
  order: E; // Le champs sur lequel on trie
  orderDirection: OrderDirection; // La direction du tri ("asc" ou "desc")
}

/* TODO : delete !!! */
export interface FormulairePagination<E> {
  // E => enum indiquant le nom du champ sur lequel on trie
  pageSize: number;
  bookmark: string | null; // Bookmark de la precedente requete dans le cas où on veut la page suivante (null si on veut la première page)
  order: E; // Le champs sur lequel on trie
  orderDirection: OrderDirection; // La direction du tri ("asc" ou "desc")
}

/* TODO : delete !!! */
export interface PaginationReponse<E> {
  totalElements: number; // Le nombre total d'éléments
  bookmark?: string; // Bookmark de la requète envoyée à la blockchain (utile pour la pagination)
  content: E[]; // Les resultats
}

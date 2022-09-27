import { OrderDirection } from './enum/OrderDirection.enum';

export interface RequestForm<E> {
  // E => enum indiquant le nom du champ sur lequel on trie
  order: E, // Le champs sur lequel on trie
  orderDirection: OrderDirection, // La direction du tri ("asc" ou "desc")
}

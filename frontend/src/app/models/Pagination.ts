export interface PaginationForm<Ordre> {
  pagesize: number;
  bookmark: string; // Bookmark de la precedente requete dans le cas où on veut la page suivante (null si on veut la première page)
  order: Ordre;
}

export interface PaginationResponse {
  totalElements: number;
  bookmark: string; // Bookmark de la requète envoyée à la blockchain (utile pour la pagination)
}

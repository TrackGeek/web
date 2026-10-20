export interface BookEdition {
  id: number;
  title: string | null;
  imageUrl: string | null;
  language: string | null;
  publisher: string | null;
  numberOfPages: number | null;
  isbn10: string | null;
  isbn13: string | null;
  releaseYear: number | null;
  releaseDate: string | null;
  editionFormat: string | null;
}

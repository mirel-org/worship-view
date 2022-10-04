export type BibleReferenceType = {
  book: string;
  chapter: number;
  verse: number;
};
export type BibleTextType = {
  [book: string]: string[][];
};

export interface GetBookType {
  id?: number;
  type?: "all" | "id" | "filter";
  limit?: number;
  filter?: {
    ISBN?: string;
    title?: string;
    publisher_date?: Date;
    status?: string;
    createAt?: Date;
  };
}

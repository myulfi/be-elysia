export interface QueryResult {
    query: string,
    name: string | null,
    action: string | null,
    error: string | null,
    row: number,
}
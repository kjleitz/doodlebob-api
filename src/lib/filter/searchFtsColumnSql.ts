import { FindOperator, Raw } from "typeorm";

export default function searchFtsColumnSql(query: string): FindOperator<any> {
  // NB: Can switch to `plainto_tsquery()` instead of `websearch_to_tsquery()`
  // if the latter is too slow. It should be just as performant unless the user
  // has a more complex search query (e.g., with quoted strings, excluded terms,
  // and/or logical OR usage). For websearch_to_tsquery syntax options, visit
  // the following link and then find-in-page "websearch_to_tsquery":
  // https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-PARSING-QUERIES
  return Raw((columnAlias) => `${columnAlias} @@ websearch_to_tsquery('english', :query)`, { query });
}

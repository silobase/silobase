type QueryInput = Record<string, string | string[]>;

export const buildFiltersToRaw = (
  table: string,
  query: QueryInput,
  dbClient: string
): { rawSql: string; bindings: any[] } => {
  const where: string[] = [];
  const having: string[] = [];
  const bindings: any[] = [];
  const joinClauses: string[] = [];

  let topClause = '';
  let limitClause = '';
  let offsetClause = '';
  let groupByClause = '';
  let orderByClause = '';
  let selectedColumns: string[] = ['*'];

  dbClient = dbClient.toLowerCase();
  const usesLimitOffset = ['pg', 'postgres', 'mysql', 'sqlite', 'sqlite3'].includes(dbClient);
  const isMSSQL = dbClient === 'mssql';

  // ---------- PARSE QUERY ----------
  for (const key in query) {
    const value = query[key];

    // Normalize all query values as array of strings
    const values = Array.isArray(value) ? value.map(String) : [String(value)];

    // ---------- JOIN ----------
    if (key === 'join') {
      for (const join of values) {
        const [joinTable, on] = join.split(':on=');
        const joinStr = isMSSQL
          ? `JOIN "${joinTable}" WITH (NOLOCK) ON ${on.replace(/=/g, ' = ')}`
          : `JOIN "${joinTable}" ON ${on.replace(/=/g, ' = ')}`;
        joinClauses.push(joinStr);
      }
      continue;
    }

    // ---------- SELECT ----------
    if (key === 'select') {
      selectedColumns = values.flatMap(v => v.split(',').map(f => {
        const trimmed = f.trim();
        // If it contains AS, leave it as-is
        if (/ as /i.test(trimmed)) return trimmed;
        // If it contains function call or dot, don't quote fully
        if (/[\.\(\)]/.test(trimmed)) return trimmed;
        // Otherwise, quote simple column
        return `"${trimmed}"`;
      }));
      continue;
    }

    // ---------- LIMIT ----------
    if (key === 'limit') {
      const limit = Number(values[0]);
      if (usesLimitOffset) limitClause = `LIMIT ${limit}`;
      else if (isMSSQL) topClause = `TOP ${limit} `;
      continue;
    }

    // ---------- OFFSET ----------
    if (key === 'offset') {
      const offset = Number(values[0]);
      if (usesLimitOffset) offsetClause = `OFFSET ${offset}`;
      else if (isMSSQL) offsetClause = `OFFSET ${offset} ROWS`;
      continue;
    }

    // ---------- ORDER BY ----------
    if (key === 'orderBy') {
      const orderField = `"${values[0]}"`;
      const direction = query.order === 'desc' ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY ${orderField} ${direction}`;
      continue;
    }

    // ---------- GROUP BY ----------
    if (key === 'group_by') {
      const fields = values.flatMap(v => v.split(',').map(f => `"${f.trim()}"`));
      groupByClause = `GROUP BY ${fields.join(', ')}`;
      continue;
    }

    // ---------- HAVING ----------
    if (key.startsWith('having.')) {
      const field = key.replace('having.', '');
      for (const v of values) {
        const parts = v.split('.');
        if (parts.length < 2) continue;
        const [op, val] = parts;
        const col = `"${field}"`;
        switch (op) {
          case 'eq': having.push(`${col} = ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
          case 'gt': having.push(`${col} > ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
          case 'in': {
            const items = val.replace(/^\(|\)$/g, '').split(',').map(v => v.trim());
            having.push(`${col} IN (${items.map(() => '?').join(', ')})`);
            bindings.push(...items);
            break;
          }
        }
      }
      continue;
    }

    // ---------- WHERE ----------
    for (const v of values) {
      const parts = v.split('.');
      if (parts.length < 2) continue;
      const [op, val] = parts;
      const col = `"${key}"`;
      switch (op) {
        case 'eq': where.push(`${col} = ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
        case 'gt': where.push(`${col} > ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
        case 'gte': where.push(`${col} >= ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
        case 'lt': where.push(`${col} < ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
        case 'lte': where.push(`${col} <= ?`); bindings.push(isNaN(Number(val)) ? val : Number(val)); break;
        case 'like': where.push(`${col} LIKE ?`); bindings.push(`%${val}%`); break;
        case 'in': {
          const items = val.replace(/^\(|\)$/g, '').split(',').map(v => v.trim());
          where.push(`${col} IN (${items.map(() => '?').join(', ')})`);
          bindings.push(...items);
          break;
        }
      }
    }
  }

  // MSSQL requires ORDER BY if OFFSET is used
  if (isMSSQL && offsetClause && !orderByClause) orderByClause = `ORDER BY (SELECT NULL)`;

  // ---------- SELECT CLAUSE ----------
  const fromClause = isMSSQL ? `${table} WITH (NOLOCK)` : table;
  const selectClause = selectedColumns.includes('*') && query.exclude ? `${topClause}*` : `${topClause}${selectedColumns.join(', ')}`;

  // ---------- FINAL CLAUSES ----------
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';
  const joinClause = joinClauses.join('\n');

  let paginationClause = '';
  if (usesLimitOffset) paginationClause = [limitClause, offsetClause].filter(Boolean).join(' ');
  else if (isMSSQL && offsetClause) {
    if (topClause) {
      const limitValue = topClause.replace('TOP', '').trim();
      paginationClause = `${offsetClause} FETCH NEXT ${limitValue} ROWS ONLY`;
    } else paginationClause = offsetClause;
  }

  const rawSql = `
    SELECT ${selectClause} FROM ${fromClause}
    ${joinClause}
    ${whereClause}
    ${groupByClause}
    ${havingClause}
    ${orderByClause}
    ${paginationClause}
  `.trim();

  return { rawSql, bindings };
};

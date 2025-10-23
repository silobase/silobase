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

  const parseCondition = (cond: string): string | null => {
    // e.g. firstname.ilike.%john%
    const parts = cond.split('.');
    if (parts.length < 3) return null;
    const [col, op, ...rest] = parts;
    const val = rest.join('.'); // in case value has dots
    const colName = `"${col}"`;

    switch (op) {
      case 'eq': where.push(`${colName} = ?`); bindings.push(val); return null;
      case 'neq': where.push(`${colName} != ?`); bindings.push(val); return null;
      case 'gt': where.push(`${colName} > ?`); bindings.push(val); return null;
      case 'gte': where.push(`${colName} >= ?`); bindings.push(val); return null;
      case 'lt': where.push(`${colName} < ?`); bindings.push(val); return null;
      case 'lte': where.push(`${colName} <= ?`); bindings.push(val); return null;
      case 'like': where.push(`${colName} LIKE ?`); bindings.push(val); return null;
      case 'ilike': where.push(`${colName} ILIKE ?`); bindings.push(val); return null;
      case 'in': {
        const items = val.replace(/^\(|\)$/g, '').split(',').map(v => v.trim());
        where.push(`${colName} IN (${items.map(() => '?').join(', ')})`);
        bindings.push(...items);
        return null;
      }
      default: return null;
    }
  };

  // ---------- PARSE QUERY ----------
  for (const key in query) {
    const value = query[key];
    const values = Array.isArray(value) ? value.map(String) : [String(value)];

    // ---------- Supabase-style OR / AND ----------
    if (key === 'or' || key === 'and') {
      const logicalOp = key.toUpperCase(); // "OR" / "AND"
      const group = values[0];
      const inner = group.replace(/^\(|\)$/g, '');
      const conditions = inner.split(',').map(c => c.trim());
      const groupClauses: string[] = [];

      for (const cond of conditions) {
        const parts = cond.split('.');
        if (parts.length < 3) continue;
        const [col, op, ...rest] = parts;
        const val = rest.join('.');
        const colName = `"${col}"`;

        switch (op) {
          case 'eq': groupClauses.push(`${colName} = ?`); bindings.push(val); break;
          case 'neq': groupClauses.push(`${colName} != ?`); bindings.push(val); break;
          case 'gt': groupClauses.push(`${colName} > ?`); bindings.push(val); break;
          case 'gte': groupClauses.push(`${colName} >= ?`); bindings.push(val); break;
          case 'lt': groupClauses.push(`${colName} < ?`); bindings.push(val); break;
          case 'lte': groupClauses.push(`${colName} <= ?`); bindings.push(val); break;
          case 'like': groupClauses.push(`${colName} LIKE ?`); bindings.push(val); break;
          case 'ilike': groupClauses.push(`${colName} ILIKE ?`); bindings.push(val); break;
          case 'in': {
            const items = val.replace(/^\(|\)$/g, '').split(',').map(v => v.trim());
            groupClauses.push(`${colName} IN (${items.map(() => '?').join(', ')})`);
            bindings.push(...items);
            break;
          }
        }
      }

      if (groupClauses.length > 0) where.push(`(${groupClauses.join(` ${logicalOp} `)})`);
      continue;
    }

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
      selectedColumns = values.flatMap(v =>
        v.split(',').map(f => {
          const trimmed = f.trim();
          if (/ as /i.test(trimmed)) return trimmed;
          if (/[\.\(\)]/.test(trimmed)) return trimmed;
          return `"${trimmed}"`;
        })
      );
      continue;
    }

    // ---------- LIMIT / OFFSET / ORDER / GROUP (same as before) ----------
    if (key === 'limit') {
      const limit = Number(values[0]);
      if (usesLimitOffset) limitClause = `LIMIT ${limit}`;
      else if (isMSSQL) topClause = `TOP ${limit} `;
      continue;
    }

    if (key === 'offset') {
      const offset = Number(values[0]);
      if (usesLimitOffset) offsetClause = `OFFSET ${offset}`;
      else if (isMSSQL) {
        offsetClause = `OFFSET ${offset} ROWS`;
        if (!orderByClause) orderByClause = `ORDER BY (SELECT NULL)`;
      }
      continue;
    }

    if (key === 'order') continue; // handled in orderBy
    if (key === 'orderBy') {
      const orderField = `"${values[0]}"`;
      const direction = query.order === 'desc' ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY ${orderField} ${direction}`;
      continue;
    }

    if (key === 'group_by') {
      const fields = values.flatMap(v => v.split(',').map(f => `"${f.trim()}"`));
      groupByClause = `GROUP BY ${fields.join(', ')}`;
      continue;
    }

    // ---------- Regular WHERE ----------
    for (const v of values) {
      const parts = v.split('.');
      if (parts.length < 2) continue;
      const [op, val] = parts;
      const col = `"${key}"`;
      switch (op) {
        case 'eq': where.push(`${col} = ?`); bindings.push(val); break;
        case 'gt': where.push(`${col} > ?`); bindings.push(val); break;
        case 'gte': where.push(`${col} >= ?`); bindings.push(val); break;
        case 'lt': where.push(`${col} < ?`); bindings.push(val); break;
        case 'lte': where.push(`${col} <= ?`); bindings.push(val); break;
        case 'like': where.push(`${col} LIKE ?`); bindings.push(`%${val}%`); break;
        case 'ilike': where.push(`${col} ILIKE ?`); bindings.push(`%${val}%`); break;
        case 'in': {
          const items = val.replace(/^\(|\)$/g, '').split(',').map(v => v.trim());
          where.push(`${col} IN (${items.map(() => '?').join(', ')})`);
          bindings.push(...items);
          break;
        }
      }
    }
  }

  if (isMSSQL && offsetClause && !orderByClause) orderByClause = `ORDER BY (SELECT NULL)`;

  let paginationClause = '';
  if (usesLimitOffset) paginationClause = [limitClause, offsetClause].filter(Boolean).join(' ');
  else if (isMSSQL && offsetClause) {
    if (topClause) {
      const limitValue = topClause.replace('TOP', '').trim();
      topClause = '';
      paginationClause = `${offsetClause} FETCH NEXT ${limitValue} ROWS ONLY`;
    } else paginationClause = offsetClause;
  }

  const fromClause = isMSSQL ? `${table} WITH (NOLOCK)` : table;
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const joinClause = joinClauses.join('\n');

  const selectClause =
    selectedColumns.includes('*') && query.exclude
      ? `${topClause}*`
      : `${topClause}${selectedColumns.join(', ')}`;

  const rawSql = `
    SELECT ${selectClause} FROM ${fromClause}
    ${joinClause}
    ${whereClause}
    ${groupByClause}
    ${orderByClause}
    ${paginationClause}
  `.trim();

  return { rawSql, bindings };
};

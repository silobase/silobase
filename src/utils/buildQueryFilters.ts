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

  for (const key in query) {
    const value = query[key];

    if (key === 'join') {
      const joins = Array.isArray(value) ? value : [value];
      for (const join of joins) {
        const [joinTable, on] = join.split(':on=');
        joinClauses.push(`JOIN "${joinTable}" ON ${on.replace(/=/g, ' = ')}`);
      }
    } else if (key === 'select') {
      const fields = (value as string).split(',').map(f => `"${f.trim()}"`);
      selectedColumns = fields;
    } else if (key === 'limit') {
      const limit = Number(value);
      if (dbClient === 'pg') {
        limitClause = `LIMIT ${limit}`;
      } else if (dbClient === 'mssql') {
        topClause = `TOP ${limit} `;
      }
    } else if (key === 'offset') {
      const offset = Number(value);
      if (dbClient === 'pg') {
        offsetClause = `OFFSET ${offset}`;
      } else if (dbClient === 'mssql') {
        offsetClause = `OFFSET ${offset} ROWS`;
      }
    } else if (key === 'orderBy') {
      const orderField = `"${value}"`;
      const direction = query.order === 'desc' ? 'DESC' : 'ASC';
      orderByClause = `ORDER BY ${orderField} ${direction}`;
    } else if (key.startsWith('having.')) {
      const field = key.replace('having.', '');
      const [op, val] = (value as string).split('.');
      const col = `"${field}"`;

      switch (op) {
        case 'eq':
          having.push(`${col} = ?`);
          bindings.push(val);
          break;
        case 'gt':
          having.push(`${col} > ?`);
          bindings.push(val);
          break;
        case 'in': {
          const items = val.split(',');
          having.push(`${col} IN (${items.map(() => '?').join(', ')})`);
          bindings.push(...items);
          break;
        }
      }
    } else {
      const [op, val] = (value as string).split('.');
      const col = `"${key}"`;

      switch (op) {
        case 'eq':
          where.push(`${col} = ?`);
          bindings.push(val);
          break;
        case 'gt':
          where.push(`${col} > ?`);
          bindings.push(val);
          break;
        case 'gte':
          where.push(`${col} >= ?`);
          bindings.push(val);
          break;
        case 'lt':
          where.push(`${col} < ?`);
          bindings.push(val);
          break;
        case 'lte':
          where.push(`${col} <= ?`);
          bindings.push(val);
          break;
        case 'like':
          where.push(`${col} LIKE ?`);
          bindings.push(`%${val}%`);
          break;
        case 'in': {
          const items = val.split(',');
          where.push(`${col} IN (${items.map(() => '?').join(', ')})`);
          bindings.push(...items);
          break;
        }
      }
    }
  }

  // MSSQL requires ORDER BY if OFFSET is used
  if (dbClient === 'mssql' && offsetClause && !orderByClause) {
    orderByClause = `ORDER BY (SELECT NULL)`;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';
  const joinClause = joinClauses.join('\n');

  const selectClause =
    selectedColumns.includes('*') && query.exclude
      ? `${topClause}*`
      : `${topClause}${selectedColumns.join(', ')}`;

  
  const rawSql = `
    SELECT ${selectClause} FROM ${table}
    ${joinClause}
    ${whereClause}
    ${groupByClause}
    ${havingClause}
    ${orderByClause}
    ${offsetClause}
    ${dbClient === 'pg' ? limitClause : ''}
  `.trim();
  return { rawSql, bindings };
};


// else if (key === 'group_by') {
//       const fields = (value as string).split(',').map((f) => `"${f.trim()}"`);
//       groupByClause = `GROUP BY ${fields.join(', ')}`;
//     }
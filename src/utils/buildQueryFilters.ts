type QueryInput = Record<string, string | string[]>;

export const buildFiltersToRaw = (
  table: string,
  query: QueryInput
): { rawSql: string; bindings: any[] } => {
  const where: string[] = [];
  const having: string[] = [];
  const bindings: any[] = [];
  const joinClauses: string[] = [];
  let limitClause = '';
  let offsetClause = '';
  let groupByClause = '';
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
      const fields = (value as string).split(',').map((f) => `"${f.trim()}"`);
      selectedColumns = fields;
    } 
    else if (key === 'limit') {
      limitClause = `LIMIT ${Number(value)}`;
    } else if (key === 'offset') {
      offsetClause = `OFFSET ${Number(value)}`;
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
        default:
          break;
      }
    } else {
      // Regular WHERE clause
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
        default:
          break;
      }
    }
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const havingClause = having.length ? `HAVING ${having.join(' AND ')}` : '';
  const joinClause = joinClauses.join('\n');

  const selectClause =
    selectedColumns.includes('*') && query.exclude
      ? `*`
      : selectedColumns.join(', ');

  const rawSql = `
     SELECT ${selectClause} FROM "${table}"
    ${joinClause}
    ${whereClause}
    ${groupByClause}
    ${havingClause}
    ${limitClause}
    ${offsetClause}
  `.trim();

  return { rawSql, bindings };
};


// else if (key === 'group_by') {
//       const fields = (value as string).split(',').map((f) => `"${f.trim()}"`);
//       groupByClause = `GROUP BY ${fields.join(', ')}`;
//     }
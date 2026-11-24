// columns: [{ key, label, sortable?, render? }]
export default function SortTable({ columns, rows, sort, order, onSort, onRowClick }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              className={c.sortable ? 'sortable' : ''}
              onClick={() => c.sortable && onSort(c.key)}
            >
              {c.label} {sort === c.key ? (order === 'asc' ? '▲' : '▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr><td colSpan={columns.length}>No data</td></tr>
        )}
        {rows.map((r) => (
          <tr key={r.id} onClick={() => onRowClick && onRowClick(r)} className={onRowClick ? 'clickable' : ''}>
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api';
import SortTable from '../components/SortTable';

function RateCell({ store, onSaved }) {
  const [value, setValue] = useState(store.my_rating || '');
  const [error, setError] = useState('');

  const save = async () => {
    if (!value) return setError('Pick 1-5');
    try {
      await api(`/stores/${store.id}/rate`, { method: 'POST', body: { rating: Number(value) } });
      setError('');
      onSaved();
    } catch (e) { setError(e.message); }
  };

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">Rate</option>
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>{' '}
      <button onClick={save}>{store.my_rating ? 'Modify' : 'Submit'}</button>
      {error && <small className="error"> {error}</small>}
    </span>
  );
}

export default function Stores() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [error, setError] = useState('');

  const load = () => {
    const q = new URLSearchParams({ search, sort, order }).toString();
    api(`/stores?${q}`).then(setRows).catch((e) => setError(e.message));
  };
  useEffect(load, [search, sort, order]);

  const onSort = (key) => {
    if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('asc'); }
  };

  const cols = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'overall', label: 'Overall Rating', sortable: true },
    { key: 'my_rating', label: 'My Rating', sortable: true, render: (r) => r.my_rating ?? '-' },
    { key: 'action', label: 'Rate', render: (r) => <RateCell key={r.id + '-' + r.my_rating} store={r} onSaved={load} /> },
  ];

  return (
    <>
      <input
        className="search"
        placeholder="Search by name or address"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <SortTable columns={cols} rows={rows} sort={sort} order={order} onSort={onSort} />
    </>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../api';
import SortTable from '../components/SortTable';

export default function Owner() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/stores/owner/dashboard').then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;
  if (!data.store) return <p>No store is assigned to your account yet.</p>;

  // small table: sort on client
  const rows = [...data.raters].sort((a, b) => {
    const x = a[sort], y = b[sort];
    const r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
    return order === 'asc' ? r : -r;
  });

  const onSort = (key) => {
    if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('asc'); }
  };

  const cols = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
  ];

  return (
    <>
      <div className="card">
        <h2>{data.store.name}</h2>
        <p>{data.store.address}</p>
        <h3>Average rating: {data.store.average}</h3>
      </div>
      <h3>Users who rated your store</h3>
      <SortTable columns={cols} rows={rows} sort={sort} order={order} onSort={onSort} />
    </>
  );
}

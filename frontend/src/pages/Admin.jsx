import { useEffect, useState } from 'react';
import { api } from '../api';
import SortTable from '../components/SortTable';
import { validateUser } from '../utils';

// shared hook: filters + sorting -> server query
function useList(path, initialFilters) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('asc');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = new URLSearchParams({ ...filters, sort, order }).toString();
    api(`${path}?${q}`).then(setRows).catch((e) => setError(e.message));
  }, [filters, sort, order, path]);

  const onSort = (key) => {
    if (key === sort) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setOrder('asc'); }
  };
  return { filters, setFilters, sort, order, onSort, rows, error };
}

function Filters({ filters, setFilters, withRole }) {
  const change = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  return (
    <div className="filters">
      {Object.keys(filters).filter((k) => k !== 'role').map((k) => (
        <input key={k} name={k} placeholder={`Filter by ${k}`} value={filters[k]} onChange={change} />
      ))}
      {withRole && (
        <select name="role" value={filters.role} onChange={change}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">Normal User</option>
          <option value="owner">Store Owner</option>
        </select>
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/admin/stats').then(setStats); }, []);
  if (!stats) return <p>Loading...</p>;
  return (
    <div className="stats">
      <div className="stat"><h3>{stats.users}</h3><p>Total Users</p></div>
      <div className="stat"><h3>{stats.stores}</h3><p>Total Stores</p></div>
      <div className="stat"><h3>{stats.ratings}</h3><p>Total Ratings</p></div>
    </div>
  );
}

function UsersTab() {
  const list = useList('/admin/users', { name: '', email: '', address: '', role: '' });
  const [detail, setDetail] = useState(null);
  const cols = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
  ];
  return (
    <>
      <Filters filters={list.filters} setFilters={list.setFilters} withRole />
      {list.error && <p className="error">{list.error}</p>}
      <SortTable
        columns={cols}
        rows={list.rows}
        sort={list.sort}
        order={list.order}
        onSort={list.onSort}
        onRowClick={(r) => api(`/admin/users/${r.id}`).then(setDetail)}
      />
      {detail && (
        <div className="card detail">
          <h3>User Details</h3>
          <p><b>Name:</b> {detail.name}</p>
          <p><b>Email:</b> {detail.email}</p>
          <p><b>Address:</b> {detail.address}</p>
          <p><b>Role:</b> {detail.role}</p>
          {detail.role === 'owner' && <p><b>Rating:</b> {detail.rating ?? 'No ratings yet'}</p>}
          <button onClick={() => setDetail(null)}>Close</button>
        </div>
      )}
    </>
  );
}

function StoresTab() {
  const list = useList('/admin/stores', { name: '', email: '', address: '' });
  const cols = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
  ];
  return (
    <>
      <Filters filters={list.filters} setFilters={list.setFilters} />
      {list.error && <p className="error">{list.error}</p>}
      <SortTable columns={cols} rows={list.rows} sort={list.sort} order={list.order} onSort={list.onSort} />
    </>
  );
}

function AddUser() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [msg, setMsg] = useState({ text: '', ok: false });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const err = validateUser(form);
    if (err) return setMsg({ text: err, ok: false });
    try {
      await api('/admin/users', { method: 'POST', body: form });
      setMsg({ text: 'User created', ok: true });
      setForm({ name: '', email: '', address: '', password: '', role: 'user' });
    } catch (e2) { setMsg({ text: e2.message, ok: false }); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add User</h3>
      {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
      <input name="name" placeholder="Name (20-60 chars)" value={form.name} onChange={change} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} />
      <textarea name="address" placeholder="Address" value={form.address} onChange={change} maxLength={400} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} />
      <select name="role" value={form.role} onChange={change}>
        <option value="user">Normal User</option>
        <option value="admin">Admin</option>
        <option value="owner">Store Owner</option>
      </select>
      <button type="submit">Add User</button>
    </form>
  );
}

function AddStore() {
  const empty = { name: '', email: '', address: '', ownerEmail: '' };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/stores', { method: 'POST', body: form });
      setMsg({ text: 'Store created', ok: true });
      setForm(empty);
    } catch (e2) { setMsg({ text: e2.message, ok: false }); }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add Store</h3>
      {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
      <input name="name" placeholder="Store name (max 60)" value={form.name} onChange={change} maxLength={60} required />
      <input name="email" type="email" placeholder="Store email" value={form.email} onChange={change} required />
      <textarea name="address" placeholder="Address" value={form.address} onChange={change} maxLength={400} />
      <input name="ownerEmail" type="email" placeholder="Owner email (optional, must be a Store Owner user)" value={form.ownerEmail} onChange={change} />
      <button type="submit">Add Store</button>
    </form>
  );
}

const TABS = {
  Dashboard: <Dashboard />,
  Users: <UsersTab />,
  Stores: <StoresTab />,
  'Add User': <AddUser />,
  'Add Store': <AddStore />,
};

export default function Admin() {
  const [tab, setTab] = useState('Dashboard');
  return (
    <>
      <div className="tabs">
        {Object.keys(TABS).map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {TABS[tab]}
    </>
  );
}

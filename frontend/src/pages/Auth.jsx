import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveSession } from '../api';
import { validateUser } from '../utils';

const home = { admin: '/admin', user: '/stores', owner: '/owner' };

function useAuthForm(initial, endpoint, validate) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const msg = validate ? validate(form) : '';
    if (msg) return setError(msg);
    try {
      const { token, user } = await api(endpoint, { method: 'POST', body: form });
      saveSession(token, user);
      navigate(home[user.role]);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };
  return { form, change, submit, error };
}

export function Login() {
  const { form, change, submit, error } = useAuthForm({ email: '', password: '' }, '/auth/login');
  return (
    <form className="card" onSubmit={submit}>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} required />
      <button type="submit">Login</button>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </form>
  );
}

export function Signup() {
  const { form, change, submit, error } = useAuthForm(
    { name: '', email: '', address: '', password: '' },
    '/auth/signup',
    validateUser
  );
  return (
    <form className="card" onSubmit={submit}>
      <h2>Sign up</h2>
      {error && <p className="error">{error}</p>}
      <input name="name" placeholder="Full name (20-60 chars)" value={form.name} onChange={change} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} />
      <textarea name="address" placeholder="Address (max 400 chars)" value={form.address} onChange={change} maxLength={400} />
      <input name="password" type="password" placeholder="Password (8-16, 1 uppercase, 1 special)" value={form.password} onChange={change} />
      <button type="submit">Create account</button>
      <p>Have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}

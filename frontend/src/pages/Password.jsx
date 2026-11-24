import { useState } from 'react';
import { api } from '../api';
import { passwordError } from '../utils';

export default function Password() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: false });

  const submit = async (e) => {
    e.preventDefault();
    const err = passwordError(password);
    if (err) return setMsg({ text: err, ok: false });
    try {
      await api('/auth/password', { method: 'PUT', body: { password } });
      setMsg({ text: 'Password updated', ok: true });
      setPassword('');
    } catch (e2) {
      setMsg({ text: e2.message, ok: false });
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Update Password</h2>
      {msg.text && <p className={msg.ok ? 'success' : 'error'}>{msg.text}</p>}
      <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Update</button>
    </form>
  );
}

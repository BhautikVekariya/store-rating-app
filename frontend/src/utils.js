const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRe = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export const passwordError = (p) =>
  passRe.test(p || '') ? '' : 'Password: 8-16 chars, 1 uppercase, 1 special character';

export function validateUser({ name, email, address, password }) {
  if (!name || name.length < 20 || name.length > 60) return 'Name must be 20-60 characters';
  if (!emailRe.test(email || '')) return 'Invalid email';
  if ((address || '').length > 400) return 'Address max 400 characters';
  return passwordError(password);
}

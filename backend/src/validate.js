const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passRe = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

exports.passwordError = (p) =>
  passRe.test(p || '') ? null : 'Password must be 8-16 chars with 1 uppercase and 1 special character';

exports.validateUser = ({ name, email, address, password }) => {
  const errs = [];
  if (!name || name.length < 20 || name.length > 60) errs.push('Name must be 20-60 characters');
  if (!email || !emailRe.test(email)) errs.push('Invalid email');
  if (address && address.length > 400) errs.push('Address max 400 characters');
  const pe = exports.passwordError(password);
  if (pe) errs.push(pe);
  return errs;
};

exports.validateStore = ({ name, email, address }) => {
  const errs = [];
  if (!name || name.length > 60) errs.push('Store name required, max 60 characters');
  if (!email || !emailRe.test(email)) errs.push('Invalid email');
  if (address && address.length > 400) errs.push('Address max 400 characters');
  return errs;
};

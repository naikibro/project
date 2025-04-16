export function isValidEmail(email: string) {
  if (typeof email !== 'string') return false;

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9._%+-]+@[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/;

  return emailRegex.test(email);
}

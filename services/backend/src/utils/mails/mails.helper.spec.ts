import { isValidEmail } from './mails.helper';

describe('Mail validator - function', () => {
  it('should accept Gmail addresses', () => {
    expect(isValidEmail('jean@gmail.com')).toBe(true);
    expect(isValidEmail('user123@gmail.com')).toBe(true);
  });

  it('should accept Gmail addresses with plus aliasing', () => {
    expect(isValidEmail('jean+spam@gmail.com')).toBe(true);
    expect(isValidEmail('john.doe+work@gmail.com')).toBe(true);
  });

  it('should accept email addresses with IP domains', () => {
    expect(isValidEmail('jean@122.31.5.21')).toBe(true);
    expect(isValidEmail('user@192.168.1.1')).toBe(true);
  });

  it('should accept email addresses from subdomains', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
    expect(isValidEmail('admin@support.company.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('plainaddress')).toBe(false);
    expect(isValidEmail('@@example.com')).toBe(false);
    expect(isValidEmail('user@com')).toBe(false);
    expect(isValidEmail('user@domain,com')).toBe(false);
    expect(isValidEmail('@missingusername.com')).toBe(false);
  });
});

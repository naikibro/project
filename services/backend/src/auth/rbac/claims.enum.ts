export enum Claim {
  READ_OWN_USER = 'read:own:user',
  READ_ANY_USER = 'read:any:user',
  WRITE_OWN_USER = 'write:own:user',
  WRITE_ANY_USER = 'write:any:user',
  DELETE_OWN_USER = 'delete:own:user',
  DELETE_ANY_USER = 'delete:any:user',

  // Alerts
  READ_ANY_ALERT = 'read:any:alert',
  READ_OWN_ALERT = 'read:own:alert',
  WRITE_OWN_ALERT = 'write:own:alert',
  WRITE_ANY_ALERT = 'write:any:alert',

  // Universal claims
  OMNISCIENT = 'omniscient',
}

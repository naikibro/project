export enum Claim {
  READ_OWN_USER = "read:own:user",
  READ_ANY_USER = "read:any:user",
  WRITE_OWN_USER = "write:own:user",
  WRITE_ANY_USER = "write:any:user",
  DELETE_OWN_USER = "delete:own:user",
  DELETE_ANY_USER = "delete:any:user",

  // Hotels related claims
  READ_ANY_HOTEL = "read:any:hotel",
  WRITE_ANY_HOTEL = "write:any:hotel",
  DELETE_ANY_HOTEL = "delete:any:hotel",

  // Booking related claims
  CREATE_OWN_BOOKING = "create:own:booking",
  READ_OWN_BOOKING = "read:own:booking",
  UPDATE_OWN_BOOKING = "update:own:booking",
  DELETE_OWN_BOOKING = "delete:own:booking",

  // Universal claims
  OMNISCIENT = "omniscient",
}

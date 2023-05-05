// NB: Gaps are left for new role placement. Probably a dumb way to do it, but I
//     would like to enforce a comparable hierarchy that doesn't require a data
//     migration to modify. Please don't change the number values for each role;
//     just add new ones.
enum Role {
  PEASANT = 10,
  ADMIN = 100,
}

export default Role;

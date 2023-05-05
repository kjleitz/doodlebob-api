import Resource from "ts-japi/lib/models/resource.model";
import User from "../../../orm/entities/User";
import appDataSource from "../../../orm/config/appDataSource";

export default function deserializeUser(resource: Resource<User>): User {
  const user = appDataSource.getRepository(User).create(resource.attributes ?? {});
  if (resource.id) user.id = resource.id;
  return user;
}

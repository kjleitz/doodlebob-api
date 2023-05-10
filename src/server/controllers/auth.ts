import { comparePassword } from "../../lib/auth/passwordUtils";
import appDataSource from "../../orm/config/appDataSource";
import User from "../../orm/entities/User";
import Controller, { Verb } from "../Controller";
import deserializeUserCreate from "../../lib/deserializers/users/deserializeUserCreate";
import buildUser from "../../lib/builders/users/buildUser";
import deserializeLogin from "../../lib/deserializers/auth/deserializeLogin";
import UnauthorizedError from "../../lib/errors/http/UnauthorizedError";
import decodeRefreshClaimsFromJwt from "../../lib/auth/decodeRefreshClaimsFromJwt";
import jwtTokensForUser from "../../lib/auth/jwtTokensForUser";
import setRefreshTokenOnResponse from "../middleware/helpers/setRefreshTokenOnResponse";
import setAccessTokenOnResponse from "../middleware/helpers/setAccessTokenOnResponse";
import getRefreshTokenFromRequest from "../middleware/helpers/getRefreshTokenFromRequest";
import deleteTokensOnResponse from "../middleware/helpers/deleteTokensOnResponse";
import HttpStatus from "../../lib/errors/HttpStatus";
import authGate from "../middleware/gates/authGate";

const auth = new Controller();
const userRepository = appDataSource.getRepository(User);

auth.on(Verb.POST, "/signIn", [], (req, res) => {
  const { username, password } = deserializeLogin(req.body.data);
  if (!username) throw new UnauthorizedError("Must provide a username.");
  if (!password) throw new UnauthorizedError("Must provide a password.");

  return userRepository
    .findOneBy({ username })
    .then((user) => comparePassword(user, password))
    .then((user) => jwtTokensForUser(user))
    .then(([refreshToken, accessToken, user]) => {
      setRefreshTokenOnResponse(res, refreshToken);
      setAccessTokenOnResponse(res, accessToken);
      return user;
    })
    .catch((error) => {
      deleteTokensOnResponse(res);
      throw error;
    });
});

auth.on(Verb.POST, "/signUp", [], (req, res) => {
  const attrs = deserializeUserCreate(req.body.data);

  return buildUser(attrs)
    .then((user) => userRepository.save(user))
    .then((user) => jwtTokensForUser(user))
    .then(([refreshToken, accessToken, user]) => {
      setRefreshTokenOnResponse(res, refreshToken);
      setAccessTokenOnResponse(res, accessToken);
      res.status(HttpStatus.CREATED);
      return user;
    })
    .catch((error) => {
      deleteTokensOnResponse(res);
      throw error;
    });
});

auth.on(Verb.POST, "/refresh", [], (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  if (!refreshToken) throw new UnauthorizedError("Valid refresh token required.");

  return decodeRefreshClaimsFromJwt(refreshToken)
    .then(({ id }) => userRepository.findOneByOrFail({ id }))
    .then((user) => jwtTokensForUser(user))
    .then(([newRefreshToken, accessToken, user]) => {
      setRefreshTokenOnResponse(res, newRefreshToken);
      setAccessTokenOnResponse(res, accessToken);
      return user;
    });
});

auth.on(Verb.DELETE, "/", [], (req, res) => {
  deleteTokensOnResponse(res);
  res.status(HttpStatus.NO_CONTENT);
});

auth.on(Verb.GET, "/ping", [authGate], () => "pong");

export default auth;

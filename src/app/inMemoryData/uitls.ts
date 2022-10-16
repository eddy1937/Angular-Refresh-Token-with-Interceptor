import { HttpRequest } from "@angular/common/http";
import { RequestInfo } from "angular-in-memory-web-api";
import { sign, SignOptions, verify } from "jsonwebtoken";

const SECRET_TOKEN = 'e4bf507234e15dc358faac2ce71dee7f833940f17110a909e4322b398088a895';
const SECRET_RTOKEN = '6423d3530382f0d5d011caa2aee52d8918889b0271b65eac5d369fc21b6ccf09';

const generateToken = (secret: string, options: SignOptions) => (data: any) => sign(data, secret, options);
const generateAccessToken = generateToken(SECRET_TOKEN, { expiresIn: 60 * 3 });
const generateRefreshToken = generateToken(SECRET_RTOKEN, { expiresIn: 60 * 5 });
export const generateTokenData = (data: any) => {
  return {
    accessToken: generateAccessToken(data),
    refreshToken: generateRefreshToken(data),
  };
};

const verifyToken = (secret: string) => (token: string | undefined | null) => verify(`${token}`, secret);
export const verifyAccessToken = verifyToken(SECRET_TOKEN);
export const verifyRefreshToken = verifyToken(SECRET_RTOKEN);

export type RequestInfos = RequestInfo & { req: HttpRequest<any> };

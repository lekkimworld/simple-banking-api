import { createClient as createRedisClient } from "redis";
import { URL } from "url";

const redisClient = (function () {
    const redis_uri = process.env.REDIS_URL ? new URL(process.env.REDIS_URL as string) : undefined;
    if (process.env.REDIS_URL && redis_uri && redis_uri.protocol!.indexOf("rediss") === 0) {
        return createRedisClient({
            port: Number.parseInt(redis_uri.port!),
            host: redis_uri.hostname!,
            password: redis_uri.password,
            db: 0,
            tls: {
                rejectUnauthorized: false,
                requestCert: true,
                agent: false
            }
        })
    } else {
        return createRedisClient(process.env.REDIS_URL as string);
    }
})();

export default () => {
    return redisClient;
}

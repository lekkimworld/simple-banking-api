import { createClient as createRedisClient, RedisClient } from "redis";
import { URL } from "url";

const redisClient = (function () {
    const redis_uri: URL | undefined = (function () {
        if (process.env.REDIS_TLS_URL) {
            return new URL(process.env.REDIS_TLS_URL as string);
        } else if (process.env.REDIS_URL) {
            return new URL(process.env.REDIS_URL as string);
        }
        return undefined;
    })();
    if (redis_uri && redis_uri.protocol?.indexOf("rediss") === 0) {
        return createRedisClient({
            port: Number.parseInt(redis_uri.port),
            host: redis_uri.hostname,
            password: redis_uri.password,
            db: 0,
            tls: {
                rejectUnauthorized: false,
                requestCert: true,
                agent: false,
            },
        });
    } else {
        return createRedisClient(process.env.REDIS_URL as string);
    }
})();

export default (): RedisClient => {
    return redisClient;
};

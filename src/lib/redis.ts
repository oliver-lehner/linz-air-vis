import Redis from "ioredis";

//const connectionString = process.env["REDIS_CONNECTION"];
const connectionString = "redis://:1i8Yqn8lGD2R68HnEkQObHodsX2ex9LO@redis-18489.c55.eu-central-1-1.ec2.cloud.redislabs.com:18489"

export default new Redis(connectionString)
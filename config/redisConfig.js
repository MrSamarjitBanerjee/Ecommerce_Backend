const { createClient } = require('redis')

let redisClient = null

const connectRedis = async () => {
    try {
        redisClient = createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
        })

        redisClient.on('error', (err) => {
            console.log('Redis Client Error', err)
        })

        redisClient.on('connect', () => {
            console.log('Redis connected successfully')
        })

        await redisClient.connect()
        return redisClient
    } catch (error) {
        console.log('Redis connection error:', error)
        return null
    }
}

const getRedisClient = () => {
    return redisClient
}

module.exports = {
    connectRedis,
    getRedisClient
}

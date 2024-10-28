import { Redis } from "ioredis"
import { createAdapter } from "@socket.io/redis-adapter"

export async function setupRedis() {
	// Create a publisher Redis client
	const pubClient = new Redis(process.env.REDIS_URL || undefined)
	 // Create a subscriber Redis client as a duplicate of the publisher
	const subClient = pubClient.duplicate()	
	 // Attach error handlers to both Redis clients
	pubClient.on('error', (err) => {
	console.error('Redis Publisher Client Error:', err);
	});

	subClient.on('error', (err) => {
	console.error('Redis Subscriber Client Error:', err);
	});
		
	return {
		socketIoAdapter: createAdapter(pubClient, subClient),
	}
}
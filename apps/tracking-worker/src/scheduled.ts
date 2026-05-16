// apps/tracking-worker/src/index.ts
import { Redis } from '@upstash/redis/cloudflare';

export async function handleScheduled(event: any, env: any, ctx: any) {
	const redis = Redis.fromEnv(env);
	const now = new Date();
	const minute = now.getUTCMinutes();
	const hour = now.getUTCHours();

	// 1. STATS SYNC LOGIC (Runs every 10 mins as part of the main cron)
	// We check for data first to save Upstash Workflow costs
	const [clickExists, leadKeys] = await Promise.all([redis.exists('sync_batch'), redis.scan(0, { match: 'sync:leads:*', count: 1 })]);

	const hasLeads = leadKeys[1].length > 0;

	if (clickExists || hasLeads) {
		console.log('📦 Data found! Triggering Workflow...');
		ctx.waitUntil(triggerWorkflow('*/10 * * * *', env));
	} else {
		console.log('😴 No data to sync. Skipping Sync Workflow.');
	}

	// 2. INVOICE HEALING LOGIC (Runs once an hour)
	// Since the cron is every 10 mins, this hits exactly once at the top of the hour (minute 0)
	if (minute < 10) {
		console.log('🩹 Hourly Check: Triggering Invoice Healing...');
		ctx.waitUntil(
			fetch(`${env.MAIN_APP_URL}/api/internal/heal-invoices`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-internal-secret': env.INTERNAL_SECRET,
				},
			})
				.then((res) => {
					if (!res.ok) console.error('❌ Heal API failed:', res.status);
				})
				.catch((err) => console.error('❌ Heal API Error:', err)),
		);
	}

	// 3. MIDNIGHT TASK (Runs once a day)
	// Hits during the 00:00 trigger
	if (hour === 0 && minute < 10) {
		console.log('🌙 Midnight Check: Triggering Seed Workflow...');
		ctx.waitUntil(triggerWorkflow('0 0 * * *', env));
	}
}

export async function triggerWorkflow(cron: string, env: any) {
	return fetch(`${env.MAIN_APP_URL}/api/workflows/sync`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-internal-secret': env.INTERNAL_SECRET,
		},
		body: JSON.stringify({ cron }),
	});
}

import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('AI worker security and validation', () => {
	it('handles CORS preflight requests', async () => {
		const request = new Request('https://example.com', {
			method: 'OPTIONS',
			headers: { Origin: 'https://example.com' },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://margdarshak-ai.netlify.app');
	});

	it('rejects non-POST methods', async () => {
		const request = new Request('https://example.com', { method: 'GET' });
		const response = await SELF.fetch(request);
		expect(response.status).toBe(405);
		await expect(response.json()).resolves.toEqual({ response: 'METHOD_NOT_ALLOWED' });
	});

	it('requires auth when no user key is supplied', async () => {
		const request = new Request('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages: [{ content: 'Hi' }],
				mode: 'chat',
			}),
		});
		const response = await SELF.fetch(request);
		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({ response: 'AUTH_REQUIRED' });
	});

	it('requires auth before parsing unreadable request bodies', async () => {
		const request = new Request('https://example.com', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{"messages"',
		});
		const response = await SELF.fetch(request);
		expect(response.status).toBe(401);
		await expect(response.json()).resolves.toEqual({ response: 'AUTH_REQUIRED' });
	});
});

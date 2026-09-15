import type { NextApiRequest, NextApiResponse } from 'next';

const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { url } = req.query;

	if (!url || typeof url !== 'string') {
		return res.status(400).json({ error: 'Missing url parameter' });
	}

	let target: URL;
	try {
		target = new URL(url);
	} catch {
		return res.status(400).json({ error: 'Invalid url parameter' });
	}
	if (target.protocol !== 'https:' && target.protocol !== 'http:') {
		return res.status(400).json({ error: 'Unsupported protocol' });
	}

	try {
		const response = await fetch(target, {
			headers: {
				'User-Agent': USER_AGENT,
				Referer: target.origin + '/',
				Accept: 'image/*,*/*',
			},
		});
		const contentType = response.headers.get('content-type') || '';
		if (!response.ok || !contentType.startsWith('image/')) {
			return res.status(502).json({ error: 'Not an image', status: response.status });
		}

		const buffer = await response.arrayBuffer();
		res.setHeader('Content-Type', contentType);
		res.setHeader('Cache-Control', 'private, no-store');
		res.send(Buffer.from(buffer));
	} catch {
		res.status(500).json({ error: 'Failed to fetch image' });
	}
}

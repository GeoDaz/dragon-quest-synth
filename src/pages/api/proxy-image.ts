import type { NextApiRequest, NextApiResponse } from 'next';

// Hosts autorisés pour éviter d'exposer un proxy ouvert. Les images de monstres
// proviennent quasi exclusivement du wiki Dragon Quest (Fandom).
const ALLOWED_HOSTS = ['static.wikia.nocookie.net', 'www.coupcritique.fr'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { url } = req.query;

	if (!url || typeof url !== 'string') {
		return res.status(400).json({ error: 'Missing url parameter' });
	}

	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return res.status(400).json({ error: 'Invalid url parameter' });
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return res.status(400).json({ error: 'Unsupported protocol' });
	}
	if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
		return res.status(403).json({ error: 'Host not allowed' });
	}

	try {
		const response = await fetch(parsed.toString());
		if (!response.ok) {
			return res.status(response.status).json({ error: 'Failed to fetch image' });
		}
		const buffer = await response.arrayBuffer();
		const contentType = response.headers.get('content-type') || 'image/png';

		res.setHeader('Content-Type', contentType);
		// Cache public longue durée : le proxy n'est sollicité qu'à la capture PNG,
		// on évite ainsi de re-fetcher l'image externe à chaque export.
		res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
		res.send(Buffer.from(buffer));
	} catch {
		res.status(500).json({ error: 'Failed to fetch image' });
	}
}

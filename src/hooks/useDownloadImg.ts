import { useState } from 'react';
import { downloadFromUrl, formatFileName } from '@/functions/file';
import { wait } from '@/functions';

const preLoadImages = async (node: Element): Promise<void> => {
	const images = Array.from(node.querySelectorAll('img'));

	await Promise.all(
		images.map(async image => {
			const src = image.src;
			if (src.startsWith('data:')) {
				try {
					await image.decode();
				} catch {}
				return;
			}
			if (src.startsWith('http') && !src.startsWith(window.location.origin)) return;
			try {
				const response = await fetch(src);
				const blob = await response.blob();
				const dataUrl = await new Promise<string>(resolve => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(reader.result as string);
					reader.readAsDataURL(blob);
				});
				image.src = dataUrl;
				image.removeAttribute('srcset');
				await image.decode();
			} catch (error) {
				console.error({ error });
			}
		})
	);
};

const waitForNextPaint = (): Promise<void> =>
	new Promise(resolve =>
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	);

const useDownloadImg = (name: string | undefined) => {
	const [downloading, setDownloading] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>();

	const downloadImage = async (selector: string) => {
		setDownloading(true);
		setError(undefined);

		let node: HTMLElement | null = null;
		try {
			const domtoimage = (await import('dom-to-image-more')).default;

			await wait(500);
			node = document.querySelector(selector) as HTMLElement | null;
			if (!node) throw new Error(`${selector} introuvable`);

			node.classList.add('captured');
			await preLoadImages(node);
			await waitForNextPaint();
			await wait(500);

			const dataUrl = await domtoimage.toPng(node, {
				quality: 1,
				width: node.scrollWidth,
				height: node.scrollHeight,
				style: { overflow: 'visible' },
				corsImg: { url: '/api/proxy-image?url=#{cors}' },
			});

			downloadFromUrl(dataUrl, formatFileName((name || 'line') + '.png'));
		} catch (error) {
			console.error({ error });
			if (error instanceof Error) setError(error.message);
		} finally {
			node?.classList.remove('captured');
			setDownloading(false);
		}
	};

	return { downloadImage, downloading, error };
};

export default useDownloadImg;

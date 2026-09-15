import { useEffect, useRef } from 'react';

const WATCH_DURATION = 5000;
const SETTLE_DELAY = 150;
const DRIFT_TOLERANCE = 1;

const documentTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

const useScrollToAnchor = () => {
	const cancelRef = useRef<() => void>();

	const cancel = () => cancelRef.current?.();

	useEffect(() => cancel, []);

	const scrollToAnchor = (id: string, behavior: ScrollBehavior = 'smooth') => {
		cancel();
		const target = document.getElementById(id);
		if (!target) return false;

		let frame = 0;
		let anchorTop = documentTop(target);
		let lastY = window.scrollY;
		let settledAt = performance.now();
		const start = settledAt;

		const stop = () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('wheel', stop);
			window.removeEventListener('touchstart', stop);
			window.removeEventListener('keydown', stop);
			cancelRef.current = undefined;
		};

		const align = (el: HTMLElement) => {
			anchorTop = documentTop(el);
			el.scrollIntoView({ behavior });
		};

		const tick = (now: number) => {
			if (now - start > WATCH_DURATION) return stop();
			const el = document.getElementById(id);
			const y = window.scrollY;
			if (y !== lastY) {
				lastY = y;
				settledAt = now;
			} else if (
				el &&
				now - settledAt > SETTLE_DELAY &&
				Math.abs(documentTop(el) - anchorTop) > DRIFT_TOLERANCE
			) {
				align(el);
				settledAt = now;
			}
			frame = requestAnimationFrame(tick);
		};

		window.addEventListener('wheel', stop, { passive: true });
		window.addEventListener('touchstart', stop, { passive: true });
		window.addEventListener('keydown', stop);
		align(target);
		frame = requestAnimationFrame(tick);
		cancelRef.current = stop;
		return true;
	};

	return scrollToAnchor;
};

export default useScrollToAnchor;

import { useEffect } from 'react';

const HEADER_VAR = '--dl-header-height';
const BAR_VAR = '--dl-filters-height';

const useStickyBar = (barRef: React.RefObject<HTMLElement>) => {
	useEffect(() => {
		const bar = barRef.current;
		if (!bar || typeof ResizeObserver === 'undefined') return;
		const root = document.documentElement.style;
		const header = document.querySelector<HTMLElement>('header.sticky-top');
		const measure = () => {
			if (header) root.setProperty(HEADER_VAR, `${header.offsetHeight}px`);
			root.setProperty(BAR_VAR, `${bar.offsetHeight}px`);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(bar);
		if (header) observer.observe(header);
		return () => {
			observer.disconnect();
			root.removeProperty(HEADER_VAR);
			root.removeProperty(BAR_VAR);
		};
	}, [barRef]);
};

export default useStickyBar;

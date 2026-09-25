import { useState, useEffect, useRef, useMemo } from 'react';

const useIsVisible = () => {
	const ref = useRef(null);
	const [visible, setVisible] = useState<boolean>(false);

	// const observer = useMemo(
	// 	() =>
	// 		typeof IntersectionObserver !== 'undefined' &&
	// 		new IntersectionObserver(([entry], observer) => {
	// 			if (entry.isIntersecting) {
	// 				setVisible(entry.isIntersecting);
	// 				observer.unobserve(ref.current as any);
	// 			}
	// 		}),
	// 	[]
	// );

	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver(([entry], observer) => {
			if (entry.isIntersecting) {
				setVisible(true);
				observer.disconnect();
			}
		});
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [ref]);

	return [ref, visible];
};

export default useIsVisible;

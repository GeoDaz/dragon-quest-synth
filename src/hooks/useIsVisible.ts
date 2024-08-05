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
		const observer = new IntersectionObserver(([entry], observer) => {
			if (entry.isIntersecting) {
				setVisible(entry.isIntersecting);
				observer.unobserve(ref.current as any);
			}
		});
		observer.observe(ref.current as any);
		// (observer as IntersectionObserver).observe(ref.current as any);
		// (observer as IntersectionObserver).disconnect();
		// return () => {
		// };
	}, [ref /* , observer */]);

	return [ref, visible];
};

export default useIsVisible;

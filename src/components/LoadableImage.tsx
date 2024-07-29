import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Spinner } from 'react-bootstrap';
import { OnLoadingComplete } from 'next/dist/shared/lib/get-img-props';

const NOT_FOUND = '/images/unknown.jpg';

export interface LoadableImageProps {
	src: string;
	alt: string;
	title?: string;
	height: number;
	width: number;
	className?: string;
	style?: object;
}
const LoadableImage: React.FC<LoadableImageProps> = ({
	src,
	alt,
	title = alt,
	height,
	width,
	className,
	style,
}) => {
	const [loading, setLoading] = useState(true);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	useEffect(() => {
		if (src) {
			setLoading(true);
			setLoadingStyle({ opacity: 1, zIndex: 5 });
		}
	}, [src]);

	return (
		<div className="position-relative" style={{ width, height }}>
			{loading && (
				<div className="spinner-wrapper absolute-center" style={loadingStyle}>
					<Spinner animation="grow" />
				</div>
			)}
			<Image
				src={src}
				onLoad={e => {
					setTimeout(() => {
						setLoading(false);
						setLoadingStyle({ opacity: 0, zIndex: 2 });
					}, 300);
					setLoadingStyle({ zIndex: loadingStyle.zIndex, opacity: 0 });
				}}
				alt={alt}
				className={className}
				width={width}
				height={height}
				title={title}
				style={style}
			/>
			{/* <span className="sr-only">{name}</span> */}
		</div>
	);
};

export default LoadableImage;

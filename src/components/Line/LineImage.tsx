import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { makeClassName } from '@/functions';
import { Spinner } from 'react-bootstrap';
import { ImagesContext } from '@/context/images';

const NOT_FOUND = '/images/unknown.jpg';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	title?: string;
	className?: string;
	style?: object;
	loadable?: boolean;
}
const LineImage: React.FC<Props> = ({
	name,
	title = name,
	className,
	style,
	loadable = true,
}) => {
	const images = useContext(ImagesContext);
	const [src, setSrc] = useState(images[name] || NOT_FOUND);
	const [loading, setLoading] = useState(true);
	const [ratioWidth, setRatioWidth] = useState(1);
	const [ratioHeight, setRatioHeight] = useState(1);
	const [loadingStyle, setLoadingStyle] = useState({ opacity: 1, zIndex: 2 });

	useEffect(() => {
		if (name) {
			const path = images[name];
			if (path && path != src) {
				setLoading(true);
				setLoadingStyle({ opacity: 1, zIndex: 5 });
				setSrc(path);
			}
		}
	}, [name]);

	return (
		<>
			{loadable && loading && (
				<div className="spinner-wrapper" style={loadingStyle}>
					<Spinner animation="border" />
				</div>
			)}
			<Image
				src={src}
				onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
					setSrc(NOT_FOUND);
					setLoading(false);
				}}
				onLoad={e => {
					setTimeout(() => {
						setLoading(false);
						setLoadingStyle({ opacity: 0, zIndex: 2 });
					}, 300);
					setLoadingStyle({ zIndex: loadingStyle.zIndex, opacity: 0 });
				}}
				onLoadingComplete={({ naturalWidth, naturalHeight }) => {
					if (naturalWidth > naturalHeight) {
						setRatioHeight(naturalWidth / naturalHeight || 1);
					} else {
						setRatioWidth(naturalHeight / naturalWidth || 1);
					}
				}}
				alt={name}
				className={makeClassName('line-img rounded', className)}
				width={150 / ratioWidth}
				height={150 / ratioHeight}
				title={title}
				style={style}
			/>
			<span className="sr-only">{name}</span>
		</>
	);
};

export default LineImage;

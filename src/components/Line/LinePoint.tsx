import React from 'react';
import Link from 'next/link';
import { makeClassName } from '@/functions';
import Icon from '@/components/Icon';
import LineImage from './LineImage';

interface Props extends React.ImgHTMLAttributes<any> {
	name: string;
	line?: string;
	title?: string;
	type?: string;
	className?: string;
	style?: object;
	children?: React.ReactNode;
	available?: boolean;
}
const LinePoint: React.FC<Props> = ({
	name,
	line = name,
	style,
	available,
	children,
	className,
	...props
}) => {
	if (available === false) {
		return (
			<div
				title={name}
				className={makeClassName('line-point pictured unavailable', className)}
				style={style}
			>
				<div className="line-point-safe-zone">
					<LineImage name={name} {...props} />
				</div>
				<span className="absolute-legend hover-only text-warning fw-bold">
					<Icon name="exclamation-triangle-fill" /> Work in progress...
				</span>
				{children}
			</div>
		);
	}
	return (
		<Link
			href={`/${type}/${line}`}
			title={name}
			className={makeClassName(
				'line-point pictured',
				available && 'available',
				className
			)}
			style={style}
		>
			<div className="line-point-safe-zone">
				<LineImage name={name} {...props} />
			</div>
			{available && (
				<Icon
					name="arrow-right-circle-fill"
					className="text-primary hover-only circle"
				/>
			)}
			{children}
		</Link>
	);
};

export default LinePoint;

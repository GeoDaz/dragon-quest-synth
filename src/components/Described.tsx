import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { makeClassName } from '@/functions';

const bodyContainer = () => document.body;

interface Props {
	text?: string;
	className?: string;
	children: React.ReactNode;
}
const Described: React.FC<Props> = ({ text, className, children }) => {
	if (!text) {
		return <span className={className}>{children}</span>;
	}
	return (
		<OverlayTrigger
			placement="bottom"
			container={bodyContainer}
			overlay={
				<Popover className="described-popover">
					<Popover.Body>{text}</Popover.Body>
				</Popover>
			}
		>
			<span className={makeClassName('described', className)} tabIndex={0}>
				{children}
			</span>
		</OverlayTrigger>
	);
};

export default Described;

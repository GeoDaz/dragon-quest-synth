import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { makeClassName } from '@/functions';

const bodyContainer = () => document.body;

interface Props {
	text?: React.ReactNode;
	className?: string;
	popoverClassName?: string;
	children: React.ReactNode;
}
const Described: React.FC<Props> = ({ text, className, popoverClassName, children }) => {
	if (!text) {
		return <span className={className}>{children}</span>;
	}
	return (
		<OverlayTrigger
			placement="bottom"
			container={bodyContainer}
			overlay={
				<Popover className={makeClassName('described-popover', popoverClassName)}>
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

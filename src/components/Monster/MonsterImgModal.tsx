import React from 'react';
import { Modal } from 'react-bootstrap';
import LineImage from '../Line/LineImage';

interface Props {
	name: string;
	title?: string;
	mirror?: boolean;
	open: boolean;
	handleClose: () => void;
}

const MonsterImgModal: React.FC<Props> = ({
	name,
	title,
	mirror,
	open = false,
	handleClose,
}) => {
	if (!name) return null;
	return (
		<Modal
			show={open}
			onHide={handleClose}
			className="monster-img-modal pt-4"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title className="break-word">{title || name}</Modal.Title>
			</Modal.Header>
			<Modal.Body className="text-center overflow-auto">
				<div className="line-point m-auto">
					<div className="line-point-safe-zone">
						<LineImage name={name} mirror={mirror} height={375} width={375} />
					</div>
				</div>
			</Modal.Body>
		</Modal>
	);
};

export default MonsterImgModal;

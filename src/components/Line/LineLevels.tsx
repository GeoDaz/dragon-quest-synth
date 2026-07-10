import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { GridContext } from '@/context/grid';
import { addLineRow, removeLineRow } from '@/reducers/lineReducer';
import Icon from '../Icon';
import Line from '@/types/Line';

interface Props {
	line: Line;
}
const LineLevels: React.FC<Props> = ({ line }) => {
	const { handleEdit, handleUpdate } = useContext(GridContext);

	const handleRemove = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate && line.size > 1) {
			handleUpdate(removeLineRow, y);
		}
	};

	const handleAdd = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			handleUpdate(addLineRow, y);
		}
	};

	const handleAddBefore = (e: any, y: number) => {
		e.stopPropagation();
		if (handleUpdate) {
			handleUpdate(addLineRow, y - 1);
		}
	};

	if (!line.size) return null;
	return (
		<div className="levels">
			{Array.from({ length: line.size }).map((_, i) => (
				<div key={i} className="level">
					{!!handleEdit && (
						<>
							{i == 0 && (
								<Button
									variant="primary"
									className="add before"
									title="insert row before"
									onClick={e => handleAddBefore(e, i)}
								>
									<Icon name="plus-lg" />
								</Button>
							)}
							<Button
								variant="primary"
								className="add"
								title="insert row"
								onClick={e => handleAdd(e, i)}
							>
								<Icon name="plus-lg" />
							</Button>
							<Button
								variant="danger"
								title="remove row"
								onClick={e => handleRemove(e, i)}
							>
								<Icon name="trash3-fill" />
							</Button>
						</>
					)}
				</div>
			))}
		</div>
	);
};

export default LineLevels;

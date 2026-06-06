import { useState } from 'react';
import LineImage, { LineImageProps } from '../Line/LineImage';
import { makeClassName } from '@/functions';
import MonsterImgModal from './MonsterImgModal';

interface MonsterImgProps extends LineImageProps {
	small?: boolean;
	expandable?: boolean;
}
const MonsterImg = ({
	small = false,
	expandable = false,
	...props
}: MonsterImgProps) => {
	const size = (small ? 45 : 90) - 6;
	const [open, setOpen] = useState(false);
	return (
		<>
			<div
				className={makeClassName('line-point-safe-zone', expandable && 'click')}
				onClick={expandable ? () => setOpen(true) : undefined}
			>
				<LineImage height={size} width={size} {...props} />
			</div>
			{expandable && open && (
				<MonsterImgModal
					name={props.name}
					title={props.title}
					mirror={props.mirror}
					open={open}
					handleClose={() => setOpen(false)}
				/>
			)}
		</>
	);
};

export default MonsterImg;

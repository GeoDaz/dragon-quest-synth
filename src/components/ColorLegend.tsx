import React from 'react';
import { legend } from '@/consts/colors';
import Icon from './Icon';
import Popup from './Popup';
import useTranslate from '@/hooks/useTranslate';

const ColorLegend: React.FC = () => {
	const { translateUI } = useTranslate();
	return (
		<div className="color-legend ms-3">
			<p className="mb-1">{translateUI('Legend')}&nbsp;:</p>
			<div className="legend">
				{legend.map(({ color, text }, i) => (
					<Popup
						key={i}
						trigger={
							<span className="d-inline-block me-3">
								<Icon
									name="circle-fill"
									className="click"
									style={{ color }}
								/>
							</span>
						}
					>
						<span>{translateUI(text)}</span>
					</Popup>
				))}
			</div>
		</div>
	);
};
export default ColorLegend;

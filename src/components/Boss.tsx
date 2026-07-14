import React from 'react';
import MonsterImg from '@/components/Monster/MonsterImg';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName } from '@/functions';
import { Boss as BossInterface } from '@/types/Boss';

const badgeColor = (role: string): string => {
	switch (role) {
		case 'Final Boss':
			return 'bg-danger';
		case 'Secret Boss':
			return 'bg-purple';
		default:
			return 'bg-secondary';
	}
};

const Boss = ({ boss }: { boss: BossInterface }) => {
	const { translateUI } = useTranslate();
	const isFinal = boss.role === 'Final Boss';

	return (
		<div className="text-center">
			<div className="d-inline-block position-relative line-point pictured">
				<MonsterImg name={boss.name} title={boss.name} expandable />
			</div>
			<div
				className={makeClassName('small text-truncate', isFinal && 'fw-bold')}
				title={boss.name}
			>
				{boss.name}
			</div>
			<span className={makeClassName('badge', badgeColor(boss.role))}>
				{translateUI(boss.role)}
			</span>
			{!!boss.note && (
				<div className="small text-muted mt-1">{boss.note}</div>
			)}
		</div>
	);
};

export default Boss;

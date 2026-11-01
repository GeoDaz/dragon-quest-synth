import Icon from '@/components/Icon';
import Rank from '@/components/Monster/Rank';
import useTranslate from '@/hooks/useTranslate';
import { makeClassName } from '@/functions';
import MockMonster from './MockMonster';

const goals = [
	{ name: 'Slime Knight', rank: 'F', parents: ['Slime Stack', 'Gloomy Grublin'], missing: [] },
	{ name: 'She-Slime', rank: 'F', parents: ['Slime', 'Firespirit'], missing: ['Firespirit'] },
];

const reserve = [
	{ name: 'Slime', count: 2 },
	{ name: 'Slime Stack', count: 1 },
	{ name: 'Gloomy Grublin', count: 1 },
	{ name: 'Dracky', count: 1 },
];

const syntheses = [
	{ name: 'Slime Knight', rank: 'F', parents: ['Slime Stack', 'Gloomy Grublin'], gain: 1 },
	{ name: 'Mottle Slime', rank: 'F', parents: ['Slime', 'Gloomy Grublin'], gain: 1 },
	{ name: 'Healslime', rank: 'G', parents: ['Slime', 'Dracky'], gain: 0 },
];

const ReserveMock = () => {
	const { translateUI, translateMonster } = useTranslate();
	return (
		<div className="home-mock home-reserve" aria-hidden="true">
			<div className="home-mock-bar">
				<span />
				<span />
				<span />
				<span className="home-mock-label">DQM4</span>
			</div>
			<div className="home-reserve-body">
				<p className="home-reserve-title">
					<Icon name="box-seam" /> {translateUI('Reserve')}
					<span className="home-reserve-count">5</span>
				</p>
				<p className="home-reserve-heading">
					<Icon name="bullseye" /> {translateUI('Goals')}
				</p>
				<ul className="home-reserve-list">
					{goals.map(goal => {
						const ready = !goal.missing.length;
						return (
							<li key={goal.name} className={makeClassName('home-reserve-row goal', ready && 'ready')}>
								<MockMonster name={goal.name} size="sm" />
								<span className="home-reserve-main">
									<span className="home-reserve-name">{translateMonster(goal.name)}</span>
									<span className="home-reserve-parents">
										{goal.parents.map(parent => (
											<MockMonster
												key={parent}
												name={parent}
												size="xs"
												missing={goal.missing.includes(parent)}
											/>
										))}
									</span>
								</span>
								<span
									className={makeClassName('home-reserve-status', ready && 'ready')}
									title={translateUI(ready ? 'Ready to synthesize' : 'Missing components')}
								>
									<Icon name={ready ? 'check-circle-fill' : 'hourglass-split'} />
								</span>
								<Rank name={goal.rank} />
							</li>
						);
					})}
				</ul>
				<p className="home-reserve-heading">
					<Icon name="box-seam" /> {translateUI('Monsters in reserve')}
				</p>
				<ul className="home-reserve-chips">
					{reserve.map(({ name, count }) => (
						<li key={name}>
							<MockMonster name={name} size="xs" />
							<span>{translateMonster(name)}</span>
							{count > 1 && <b>×{count}</b>}
						</li>
					))}
				</ul>
				<p className="home-reserve-heading">
					<Icon name="stars" /> {translateUI('Possible syntheses')}
				</p>
				<ul className="home-reserve-list">
					{syntheses.map(option => (
						<li key={option.name} className="home-reserve-row">
							<MockMonster name={option.name} size="sm" />
							<span className="home-reserve-main">
								<span className="home-reserve-name">{translateMonster(option.name)}</span>
								<span className="home-reserve-parents">
									{option.parents.map(parent => (
										<MockMonster key={parent} name={parent} size="xs" />
									))}
								</span>
							</span>
							{option.gain > 0 && (
								<span className="home-reserve-gain" title={translateUI('Rank up')}>
									<Icon name="arrow-up" />
									{option.gain}
								</span>
							)}
							<Rank name={option.rank} />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default ReserveMock;

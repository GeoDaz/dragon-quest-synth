import React, { useState, useReducer, useMemo } from 'react';
import Layout from '@/components/Layout';
import { createFile, download, getDirPaths } from '@/functions/file';
import ZoomBar from '@/components/ZoomBar';
import ColorLegend from '@/components/ColorLegend';
import LineGrid from '@/components/Line/LineGrid';
import { GetStaticProps } from 'next';
import { SearchContext } from '@/context/search';
import lineReducer, { defaultLine, setLineAction } from '@/reducers/lineReducer';
import Icon from '@/components/Icon';
import BoostrapSwitch from '@/components/BoostrapSwitch';
import { Button } from 'react-bootstrap';
import ReportABugLink from '@/components/ReportABugLink';
import useLocalStorage from '@/hooks/useLocalStorage';
import useDownloadImg from '@/hooks/useDownloadImg';
import DownloadDropdown from '@/components/DownloadDropdown';
import Line from '@/types/Line';
import UploadCode from '@/components/UploadCode';
import transformLine, { areCollapsablePoints } from '@/functions/transformer/line';
import { ImagesContext } from '@/context/images';
import { StringObject } from '@/types/Ui';
import Search from '@/types/Search';
import { getDubbedSearchList } from '@/functions/search';
import { MonsterInfoContext, MonsterInfos } from '@/context/monsterInfo';
import { games } from '@/functions/games';
import { Families } from '@/types/Monster';

interface Props {
	images: StringObject;
	search: Search;
	monsterInfos: MonsterInfos;
}
const PageBuild: React.FC<Props> = ({ images = {}, search, monsterInfos = {} }) => {
	const [line, dispatchState] = useReducer<Line, [Record<string, any>]>(lineReducer, defaultLine);
	const setLine = (line: Line) => dispatchState(setLineAction(line));
	const { setItemToStorage } = useLocalStorage('line', line, setLine);
	const [zoom, setZoom] = useState<number>(100);
	const [edition, edit] = useState<boolean>(true);
	useMemo(() => areCollapsablePoints(line), [line]);
	const { downloadImage, downloading, error } = useDownloadImg(line.title);

	const handleDownloadImage = () => {
		const editionState = edition;
		const zoomState = zoom;
		edit(false);
		setZoom(100);
		downloadImage('.frame .line-wrapper').then(() => {
			edit(editionState);
			setZoom(zoomState);
		});
	};

	const handleUpdate = (action: CallableFunction, ...args: any[]) => {
		dispatchState(action(...args));
	};

	const handleVoid = () => {
		setLine(defaultLine);
		// default value is not automaticaly stored in localstorage
		setItemToStorage(defaultLine);
	};

	const downloadCode = () => {
		const file = createFile(JSON.stringify(line), 'application/json');
		download(file, 'line.json');
	};
	const uploadCode = (json: Line | null) => {
		try {
			json;
		} catch (e) {
			// TODO make a message modal
			console.error(e);
			return;
		}
		setLine(json ? (transformLine(json) as Line) : defaultLine);
	};

	// const downloadImage = () => {
	// 	// if (!ref.current) return;
	// 	// screenshot();
	// 	capture();
	// };

	return (
		<Layout
			title="Make your synthesis three"
			metatitle="Builder"
			metadescription="Make your own Dragon Quest synthesis threes. Be creative your are free."
		>
			<blockquote className="blockquote">
				<b>Click</b> on a case from the grid to set a Monster.
				<br /> You can make any relations between a monsters.
				<br /> Use <b>Save as</b> to export your work, either as a code file you
				can import back later, or as an image.
				<br /> Your work is saved on the browser for one line at a time but you
				can export it on your computer with the <b>Save</b> button and rework it
				later with the <b>Import</b> button.
			</blockquote>
			<div className="line-filters align-items-center">
				<BoostrapSwitch
					checked={edition}
					labelOn={
						<>
							Edit <Icon name="pencil-fill" />
						</>
					}
					labelOff={
						<>
							<Icon name="eye-fill" /> View
						</>
					}
					toggle={() => edit(!edition)}
				/>
				<Button variant="danger" onClick={handleVoid}>
					<Icon name="trash3-fill" /> Void
				</Button>
				<DownloadDropdown
					downloadCode={downloadCode}
					downloadImage={handleDownloadImage}
					loading={downloading}
					error={error}
				/>
				<UploadCode handleUpload={uploadCode} />
				<ReportABugLink />
				<ZoomBar handleZoom={setZoom} />
				<ColorLegend />
			</div>
			<SearchContext.Provider value={search}>
				<ImagesContext.Provider value={images}>
					<MonsterInfoContext.Provider value={monsterInfos}>
						<LineGrid
							line={line}
							zoom={zoom}
							handleUpdate={edition ? handleUpdate : undefined}
						/>
					</MonsterInfoContext.Provider>
				</ImagesContext.Provider>
			</SearchContext.Provider>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	try {
		const images = require('../json/monstersImages.json');
		const translatedMonsters = require('../json/monsterTranslations.json');
		const searchList: string[] = Object.keys(images);
		const search: Search = getDubbedSearchList(searchList, translatedMonsters);

		const monsterInfos: MonsterInfos = {};
		Object.values(games)
			.filter(game => game.available && game.key !== 'Custom')
			.forEach(game => {
				const families: Families = require(`../json/${game.key}.json`);
				Object.entries(families).forEach(([family, ranks]) =>
					Object.entries(ranks).forEach(([rank, monsters]) =>
						monsters.forEach(({ name }) => {
							const info = (monsterInfos[name] ||= [family, '']);
							const entry = `${game.key} ${rank}`;
							if (!info[1].split(', ').some(e => e.startsWith(`${game.key} `))) {
								info[1] = info[1] ? `${info[1]}, ${entry}` : entry;
							}
						})
					)
				);
			});

		return { props: { images, search, monsterInfos } };
	} catch (e) {
		console.error(e);
		return { props: {} };
	}
};

export default PageBuild;

import redis from '$lib/redis';
import type { RequestHandler } from '@sveltejs/kit';

const url = 'http://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json';
const stationCodes = ['S431', 'S184', 'S415', 'S416'];
const componentCodes = ['PM10kont', 'PM25kont', 'SO2', 'NO2', 'O3', 'WIV', 'WIR'];

function isDST(d: Date): boolean {
	const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
	const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
	return Math.max(jan, jul) !== d.getTimezoneOffset();
}

export const get: RequestHandler = async function () {
	const data = await getStationDataFromCache();

	if (data) {
		return {
			body: { data }
		};
	}

	try {
		const result = await getStationDataFromApi();
		const consolidatedData = consolidate(result);
		await cacheStationData(consolidatedData);
		return {
			body: { data: consolidatedData }
		};
	} catch {
		throw Error('Promise failed');
	}
};

function fetchAirData(params) {
	return fetch(`${url}?stationcode=${params.stationcode}`).then((r) => {
		return r.json();
	});
}

function fetchStationData(stationCode: string) {
	const params: AnfrageAnDasLandOber√∂sterreich = {
		stationcode: stationCode
	};
	return fetchAirData(params);
}

async function getStationDataFromApi() {
	const promises = new Array<Promise<Response>>();
	stationCodes.forEach((stationCode) => {
		promises.push(fetchStationData(stationCode));
	});
	const values = await Promise.all(promises);
	return values;
}

async function getStationDataFromCache() {
	try {
		const cached: string = await redis.get('data');
		if (cached) {
			const parsed: AirData = JSON.parse(cached);
			return parsed;
		}
	} catch (e) {
		console.error('Unable to retrieve from cache', e);
	}
	return undefined;
}

/**
 * Returns seconds until next API update (full or half hour)
 * @returns {number}
 */

function calcCacheTime(): number {
	/*unfortunately this elegant code doesn't fit the purpose because updates are not punctual 	

	const current = new Date();
	let nextUpdate: Date;
	if (current.getMinutes() < 30) {
		nextUpdate = new Date(
			current.getFullYear(),
			current.getMonth(),
			current.getDate(),
			current.getHours(),
			30
		);
	} else {
		let temp = new Date(
			current.getFullYear(),
			current.getMonth(),
			current.getDate(),
			current.getHours(),
			0
		);
		nextUpdate = new Date(temp.getTime() + 60 * 60 * 1000);
	}
	console.log(current, nextUpdate);
	return Math.floor((nextUpdate.getTime() - current.getTime()) / 1000); */
	return 300;
}

async function cacheStationData(data) {
	try {
		await redis.set('data', JSON.stringify(data), 'EX', calcCacheTime());
	} catch (e) {
		console.error('Unable to cache', e);
	}
}

function consolidate(values) {
	let data: AirData = {};
	values.forEach(async (val) => {
		const items = val.messwerte;
		const stationCode = items[0].station;
		data[stationCode] = extract(items);
	});
	return data;
}

function extract(values): StationData {
	let data = {
		PM10: undefined,
		PM25: undefined,
		NO2: undefined,
		SO2: undefined,
		O3: undefined,
		WIV: undefined,
		WIR: undefined
	};

	componentCodes.forEach((component) => {
		const componentData = values.filter((sample) => sample.komponente == component);
		if (componentData) {
			const unit =
				componentData[0]?.komponente == ('WIV' || 'WIR') ? componentData[0]?.einheit : '¬Ķg/m¬≥';
			const tmw = reduceSamples(componentData, 'TMW');
			const hmw = reduceSamples(componentData, 'HMW');
			const mw24 = reduceSamples(componentData, 'MW24');
			data[component.substring(0, 4)] = { unit, hmw, tmw, mw24 };
		}
	});
	return data;
}

function reduceSamples(samples, value: string): Measurement[] {
	return samples
		.filter((sample) => sample.mittelwert == value)
		.map((sample) => {
			const multiplier = sample.einheit == 'mg/m3' ? 1000 : 1;
			//somehow the API does not account for DST and timestamps are 1hr behind
			const time = isDST(new Date(sample.zeitpunkt))
				? sample.zeitpunkt + 3600000
				: sample.zeitpunkt;
			const value = parseFloat(sample.messwert.replace(',', '.')) * multiplier;
			return { time, value };
		});
}

import redis from '$lib/redis';
import type { RequestHandler } from '@sveltejs/kit';

const url = 'http://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json';
const stationCodes = ['S431', 'S184', 'S415', 'S416'];
const componentCodes = ['PM10kont', 'PM25kont', 'SO2', 'NO2', 'O3', 'WIV', 'WIR'];

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
	const params: AnfrageAnDasLandOberösterreich = {
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

async function cacheStationData(data) {
	try {
		await redis.set('data', JSON.stringify(data), 'EX', 24 * 60 * 60);
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
			const unit = componentData[0]?.komponente == ('WIV'||'WIR')
				? componentData[0]?.einheit
				: 'µg/m³';
			const tmw = reduceSamples(componentData, 'TMW');
			const hmw = reduceSamples(componentData, 'HMW');
			const mw24 = reduceSamples(componentData, 'MW24');
			data[component.substring(0,4)] = { unit, hmw, tmw, mw24 };
		}
	});
	return data;
}

function reduceSamples(samples, value: string): Measurement[] {
	return samples
		.filter((sample) => sample.mittelwert == value)
		.map((sample) => {
			const multiplier = (sample.einheit == "mg/m3" ? 1000 : 1);
			const time = sample.zeitpunkt;
			const value = parseFloat(sample.messwert.replace(',', '.')) * multiplier;
			return { time, value };
		});
}

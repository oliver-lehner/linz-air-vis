const url = 'http://www2.land-oberoesterreich.gv.at/imm/jaxrs/messwerte/json';
const stationCodes = ['S431', 'S184', 'S415', 'S416'];
const componentCodes = ['PM10kont','PM25kont', 'PM25kont', 'SO2', 'NO2', "WIV", "WIR"];



export async function get(request) {

}



function getAirData(stationCode, componentCode, days) {
	const params = {
		stationcode: stationCode,
		komponentencode: componentCode,
		datvon: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		datbis: new Date().toISOString().split('T')[0]
	};

	return fetch(url, {
		headers: {
			Accept: 'application/json'
		},
		method: 'GET',
		body: JSON.stringify(params)
	}).then((r) => r.json());
}

type AnfrageAnDasLandOberösterreich = {
	stationcode?: string;
	komponenentencode?: string;
	datvon?: string; //new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
	datbis?: string; //new Date().toISOString().split('T')[0]
};

type AntwortDesLandesOberösterreich = {
	messwerte: Messwert[];
};

type Messwert = {
	zeitpunkt: number;
	station: string;
	komponente: string;
	mittelwert: string;
	einheit: string;
	messwert: string;
};

type LuftiData = {
	[key: string]: { position: Position; boundingBox: Box3; scale: Vector3; rotation: Rotation };
};

type AirData = {
	[station: string]: StationData;
};

type Measurement = {
	time: number;
	value: number;
};

type StationData = {
	PM10: {
		unit: string;
		hmw: Measurement[];
		mw24: Measurement[];
		tmw: Measurement;
	};
	PM25: {
		unit: string;
		hmw: Measurement[];
		mw24: Measurement[];
		tmw: Measurement;
	};
	NO2: {
		unit: string;
		hmw: Measurement[];
		tmw: Measurement;
	};
	SO2?: {
		unit: string;
		hmw: Measurement[];
		tmw: Measurement;
	};
	O3?: {
		unit: string;
		hmw: Measurement[];
		tmw: Measurement;
	};
	WIV: {
		unit: string;
		hmw: Measurement[];
	};
	WIR: {
		unit: string;
		hmw: Measurement[];
	};
};

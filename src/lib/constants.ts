export	const stationNames = {
		S415: '24er-Turm',
		S416: 'Neue Welt',
		S431: 'Römerberg',
		S184: 'Stadtpark'
	};

export const componentColors = {
	PM10: '#6C5C5C',
	PM25: '#5C646C',
	SO2: '#5B9B6E',
	NO2: '#712D6C',
	O3: '#316C90'
};

export const targets = {
		//Table 3.6 p.88
		PM25: {
			interimTargets: [75, 50, 37.5, 25, 15],
			AQG: 15
		},
		//Table 3.9 p.97
		PM10: {
			interimTargets: [150, 100, 75, 50, 45],
			AQG: 15
		},
		//Table 3.15 p.110
		O3: {
			interimTargets: [160, 120],
			AQG: 100
		},
		//Table 3.21 p.124
		NO2: {
			interimTargets: [120, 50],
			AQG: 25
		},
		//Table 3.22 p.130
		SO2: {
			interimTargets: [125, 50],
			AQG: 40
		}
	};

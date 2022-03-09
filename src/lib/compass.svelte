<script lang="ts">
	export let orientation, speed;
</script>

<div class="compass-container">
	<svg
		version="1.1"
		id="Layer_1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		x="0px"
		y="0px"
		viewBox="0 0 256 256"
		style="enable-background:new 0 0 256 256;"
		xml:space="preserve"
	>
		<g id="face">
			<path
				class="st0"
				d="M128,79c45.8,0,83,37.2,83,83s-37.2,83-83,83s-83-37.2-83-83S82.2,79,128,79 M128,74c-48.6,0-88,39.4-88,88
		s39.4,88,88,88s88-39.4,88-88S176.6,74,128,74L128,74z"
			/>
		</g>
		<g id="needle" transform="rotate({orientation} 128 162)">
			<polygon class="st1" points="143.4,162.4 127.6,231.7 111.8,162.4 127.6,93.1 	" />
			<polygon class="st0" points="143.4,162.4 127.6,153.8 111.8,162.4 127.6,93.1 	" />
		</g>
		<g>
			<path
				class="st0"
				d="M99.8,68.3v-3.5l5.2-0.7l1.6-1.6V15.8l-1.6-1.2L99.6,14v-3.4h16.2v2.1l29.4,44V16.4l-1.6-1.6l-5.2-0.8v-3.4
		h18.1V14l-5.2,0.8l-1.6,1.6v51.9H144l-32.8-48.8v43l1.6,1.6l5.2,0.7v3.5H99.8z"
			/>
		</g>
	</svg>
	<p>{(speed * 3.6).toFixed(1) + ' km/h'}</p>
</div>

<style type="text/css">
	svg {
		color: var(--yellow);
		width: 100%;
		height:2em;
	}
	.st0 {
		fill: currentColor;
	}
	.st1 {
		fill: none;
		stroke: currentColor;
		stroke-width: 5;
		stroke-miterlimit: 10;
	}

	.compass-container {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.compass-container > p {
		text-align: left;
		font-size:0.8em;
		flex-grow: 2;
	}
</style>

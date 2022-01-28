<script>
	import * as SC from 'svelte-cubed';
	import Parrot from '$lib/parrot.svelte'
	import Particles from '$lib/particles/index.svelte'
</script>

<SC.Canvas>
	<Parrot/>
	<Particles></Particles>
	<SC.PerspectiveCamera position={[1, 1, 3]} />
	<SC.OrbitControls enableZoom={false} />
	<SC.AmbientLight intensity={0.6} />
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
</SC.Canvas>
<script>
import * as THREE from "three";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

  import * as SC from "svelte-cubed";
  import { onMount } from "svelte";
	
  function loadGLTFModel() {
    const loader = new GLTFLoader();
    return loader.loadAsync(
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Parrot.glb"
    );
  }

  let model;

  onMount(() => {
    loadGLTFModel().then((modelData) => {
      model = modelData;
    });
  });

</script>

  {#if model}
    <SC.Primitive
      object={model.scene}
      scale={[.01, .01, .01]}
    >
    </SC.Primitive>
  {/if}
<script>
    import * as THREE from "three";
    import * as SC from "svelte-cubed";
    import { tweened } from "svelte/motion";
    import { elasticOut } from "svelte/easing";
    // import { reducedMotion } from "../lib/reducedMotion";
    let rotate = 0;
    // let scale = tweened(1, { duration: $reducedMotion ? 0: 2000, easing: elasticOut });
    let scale = tweened(1, { duration: 2000, easing: elasticOut });
    let scaleType = "MEDIUM";

    // reactive statement
    $: if (scaleType === "SMALL"){
        $scale = .25;
    } else if (scaleType === "MEDIUM"){
        $scale = 1;
    } else if (scaleType === "LARGE") {
        $scale = 1.75;
    }

    SC.onFrame(() => {
      // Every frame, assign these radians to rotationY
      rotate += .01;
    })    
</script>

<SC.Canvas background={new THREE.Color('seagreen')}>
	<SC.AmbientLight
    color={new THREE.Color('white')}
    intensity={.5}
  />  
	<SC.DirectionalLight
    color={new THREE.Color('white')}
    intensity={.75}
    position={[10, 10, 10]}
  />

  <!-- MESHES -->
   <SC.Mesh
    geometry={new THREE.OctahedronGeometry()}
    material={new THREE.MeshStandardMaterial({
      color: new THREE.Color('salmon')
    })}
    rotation={[rotate, rotate, rotate]}
    scale={[$scale, $scale, $scale]}
  />

  <!-- CAMERA -->
  <SC.PerspectiveCamera near={1} far={100} fov={55}>

	</SC.PerspectiveCamera>
			<SC.OrbitControls />

<!-- all of our scene stuff will go here! -->

</SC.Canvas>

<div class="controls">
    <label>
    SMALL
        <input type="radio" bind:group={scaleType} value="SMALL" />
    </label>
    <label>
    MEDIUM
        <input type="radio" bind:group={scaleType} value="MEDIUM" />
    </label>
    <label>
    LARGE
        <input type="radio" bind:group={scaleType} value="LARGE" />
    </label>
</div>

<style>
    .controls {
        position: absolute;
        top: .5rem;
        left: .5rem;
        background: #00000088;
        padding: .5rem;
        color: white;
    }
</style>
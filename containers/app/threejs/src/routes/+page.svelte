<script>
	import * as THREE from "three";
	import * as SC from "svelte-cubed";
	// all of our javascript and logic would go here
</script>

<SC.Canvas antialias background={new THREE.Color('papayawhip')}>
	<SC.Mesh geometry={new THREE.BoxGeometry()} />
	<SC.PerspectiveCamera position={[1, 1, 3]} />
</SC.Canvas>

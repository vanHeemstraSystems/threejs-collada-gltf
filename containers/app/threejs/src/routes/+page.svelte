<script>
  import Cube from "./cube.svelte";
  import Octo from "./octo.svelte";
  import { reducedMotion } from "../lib/stores";
</script>
<h1>Home Page</h1>

<p>Cube:</p>

<div class="scene-container">
  <Cube />
</div>

<p>Octo:</p>

<div class="scene-container">
  <Octo />
</div>

<style>
  .scene-container {
    /* position relative let's the canvas position itself relative to this container */
    position: relative;
    width: 75%;
    max-width: 400px;
    height: 400px;
    margin: 0 auto;
  }
</style>
<script>
  import Home from "./home.svelte";
  import Cube from "./cube.svelte";
  import Octo from "./octo.svelte";
  // import { reducedMotion } from "../lib/reducedMotion";
</script>
<h1>Home Page</h1>

<page>
  <frame id="rootFrame" defaultPage="{Home}"></frame>
</page>

<p>Cube:</p>

<div class="scene-container">
  <Cube />
</div>

<p>Octo:</p>

<div class="scene-container">
  <Octo />
</div>

<p>An octahedron is a three-dimensional shape having eight plane faces, especially a regular solid figure with eight equal triangular faces.</p>

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
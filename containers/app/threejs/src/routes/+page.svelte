<script>
  import Cube from "./cube.svelte";
</script>
<h1>Home Page</h1>

<div class="scene-container">
  <Cube />
</div>

<p>Some text goes here</p>

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
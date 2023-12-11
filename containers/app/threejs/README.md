# ThreeJS

We can follow along this tutorial "[Svelte-Cubed: Loading Your glTF Models](https://dev.to/alexwarnes/svelte-cubed-loading-your-gltf-models-14lf)" in particular "[PART FOUR: Loading Your GLTF Models](https://svelte.dev/repl/8ea0488302bb434991cc5b82f653cdb5?version=3.48.0)" to load the glTF file into ThreeJS, whilst building a Svelte Application.

Start the Svelte App as follows:

```
npm run dev -- --open
```

We will be using Svelte-Cubed, hence follow the instructions at https://svelte-cubed.vercel.app/

```
npm install svelte-cubed
```

In addition, we will be using ThreeJS, so install it also:

```
npm install three
```

And as we are using TypeScript, also install:

```
npm install -D @types/three
```

Now we're ready to start building 3D graphics (in your project’s src/routes/cube.svelte, for example).

**NOTE**: You can watch the website at the location that you will be prompted.

[Your First Scene](https://svelte-cubed.vercel.app/docs/getting-started)

```
<script>
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
</script>

<SC.Canvas antialias background={new THREE.Color('papayawhip')}>
	<SC.Mesh geometry={new THREE.BoxGeometry()} />
	<SC.PerspectiveCamera position={[1, 1, 3]} />
</SC.Canvas>
```
src/routes/cube.svelte

If you’re like me, the first thing you did when you saw the cube above was to try and spin it. That won’t work until we add some controls:

```
...
    <SC.OrbitControls enableZoom={false} />
...
```
src/routes/cube.svelte

**NOTE**: What regular people call shapes are called a "mesh" in 3D-land, so we'll use that word from now on. A **mesh** is a combination of a **geometry** and a **material**, just like your table: it has a geometry (e.g. rectangle or oval) and a material (e.g. wood or glass).

Three.js offers many [geometries](https://threejs.org/docs/index.html?q=geometry) and [materials](https://threejs.org/docs/index.html?q=material) you can experiment with, and each variant can take several unique properties. 

The default MeshNormalMaterial is useful for debugging, but most of the time you’ll want to specify something else, such as MeshStandardMaterial:

```
...
	<SC.Mesh
		geometry={new THREE.BoxGeometry()}
		material={new THREE.MeshStandardMaterial({ color: 0xff3e00 })}
	/>
...
```
src/routes/cube.svelte

Your cube will now be totally black :( 

**NOTE**: *MeshStandardMaterial* interacts with light and we don't have any lights! You can experiment with a *MeshBasicMaterial* for something that does not interact with light to compare.

Since MeshStandardMaterial uses physically-based rendering, we’ll need to illuminate the mesh.

LET THERE BE LIGHT

Unsurprisingly three.js offers many lighting options. Not sure how to incorporate this pun but: something, something, *the unbearable lightness of three-ing*. 

Svelte Cubed provides components corresponding to the various lights in Three.js, such as AmbientLight and DirectionalLight:

```
...
	<SC.AmbientLight intensity={0.6} />
	<SC.DirectionalLight intensity={0.6} position={[-2, 3, 2]} />
...
```
src/routes/cube.svelte

To get a full range of interactions we'll add orbit controls after our camera.

```
...
	<SC.OrbitControls enabled enabledPan={true} enableZoom={true} enableRotate={true} enableDamping={true} maxPolarAngle={Math.PI * 0.51} />
...
```
src/routes/cube.svelte

Now you can interact with your scene by clicking and dragging, scrolling to zoom, and right-click and drag to pan.

Follow the rest of the instructions at https://svelte-cubed.vercel.app/docs/getting-started from UPDATING STATE.

we will cover two different approaches to moving things around in your scene with constant motion using onFrame and on-demand motion using svelte’s tweened stores and easing functions.

## Constant Motion

What we want to do is adjust the rotation a little bit, multiple times per second. First thought might be to use JavaScript’s setInterval and make an update every x number of milliseconds. But there’s a more performant way!

Svelte-cubed gives us a method called ```onFrame(callback)`````` that accepts a callback method where we can make some change to our scene on each frame. Let’s give it a try.

A mesh has a ```rotation``` property that accepts an array with x, y, z radian values that each describe the mesh’s rotation along the respective axis (you can brush up on your radians here: [Khan Academy: Intro to Radians](https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:trig/x2ec2f6f830c9fb89:radians/v/introduction-to-radians)). We want to rotate our mesh along the y-axis, so we’ll declare a ```rotationY``` variable, update it inside the ```onFrame``` callback, and then pass it into our mesh in the ```Octo.svelte``` file:

```
<script>
    import * as THREE from "three";
    import * as SC from "svelte-cubed";
    let rotate = 0;
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
	rotation={[0, rotate, 0]}
  />

  <!-- CAMERA -->
  <SC.PerspectiveCamera near={1} far={100} fov={55}>
  </SC.PerspectiveCamera>
  <SC.OrbitControls />

<!-- all of our scene stuff will go here! -->

</SC.Canvas>
```
containers/app/threejs/src/routes/octo.svelte

Now our Octo should be spinning along the y-axis on each frame.

Let’s go big and use the rotation variable for ALL THREE mesh axes:

```
...
    rotation={[rotate, rotate, rotate]}
...

```
containers/app/threejs/src/routes/octo.svelte

This motion makes our mesh a lot more visually engaging, and you can see how it would be helpful for something like a planet. Remember we can use this approach for updating ```any``` value: rotation, position, or scale.

But what if we have some kind of motion that we only want to happen once? Say for example we want to toggle our octahedron size between small, medium, and large. It would be cumbersome (and perform poorly) to add a bunch of conditional logic inside the ```onFrame``` call back. Svelte gives us the perfect tool for the job with a ```tweened store``````.

## Transitional Motion: On-Demand
Let’s break down what we want:

1. A set of radio inputs: small, medium, large (medium by default).
2. When I select a radio input, the octahedron should ```scale``` to match the selected size.
3. The scaling should transition smoothly from one size to another.

### STEP 1: Svelte Radio Input Binding (bonus Lesson)

We’ll create a variable to hold the selection called scaleType and set the initial value to "**MEDIUM**".

```
...
  let scaleType = "MEDIUM";
...
```
containers/app/threejs/src/routes/octo.svelte

Nailed it. Now below our canvas markup, we’ll create three radio inputs with labels:

```
...
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
...
```
containers/app/threejs/src/routes/octo.svelte

Notice that each input has a value and we ```bind``` all of them to the ```scaleType``` variable. This is some classic Svelte simplicity, no event handling to worry about. If you want to learn more about group bindings for radio and checkbox inputs, check out [the official tutorial](https://svelte.dev/tutorial/group-inputs).

But we still can’t see anything, so add a style block under all the markup:

```
...
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
...
```
containers/app/threejs/src/routes/octo.svelte

### STEP 2: Reactive Scaling

Our ```scaleType``` variable updates whenever the selection changes, and any time ```scaleType``` changes we want to update the mesh’s scale properties. Back up in our script, let’s use another wonderful Svelte feature called a reactive statement https://svelte.dev/tutorial/reactive-statements to do just that.

Below we'll declare a variable called ```scale``` with an initial value of 1, setup a reactive statement to update ```scale``` based on ```scaleType```, and then add the scale array to our mesh and use our scale value for the x, y, and z scaling.

```
...
<script>
// … other stuff in our script

let scale = 1;

// reactive statement
$: if (scaleType === "SMALL"){
    scale = .25;
} else if (scaleType === "MEDIUM"){
    scale = 1;
} else if (scaleType === "LARGE") {
    scale = 1.75;
}
</script>

<!-- … other stuff in our markup -->
 <SC.Mesh
    geometry={new THREE.OctahedronGeometry()}
    material={new THREE.MeshStandardMaterial({
      color: new THREE.Color('salmon')
    })}
    rotation={[rotate, rotate, rotate]}
    scale={[scale, scale, scale]}
  />
...
```
containers/app/threejs/src/routes/octo.svelte




==== WE ARE HERE ===


Next, we need to import our glTF model of the Lego baseplate...

Continue with these instructions, https://dev.to/alexwarnes/svelte-cubed-loading-your-gltf-models-14lf

MORE ...

================================== AUTO-GENERATED NOTES ===================================================

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

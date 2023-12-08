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

Now we're ready to start building 3D graphics (in your project’s src/routes/index.svelte, for example).

**NOTE**: You can watch the website at the location that you will be prompted.

[Your First Scene](https://svelte-cubed.vercel.app/docs/getting-started)

```
<script>
	import * as THREE from 'three';
	import * as SC from 'svelte-cubed';
</script>

<SC.Canvas>
	<SC.Mesh geometry={new THREE.BoxGeometry()} />
	<SC.PerspectiveCamera position={[1, 1, 3]} />
</SC.Canvas>
```
src/routes/+page.svelte

MORE ...

==========================================================================================================

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

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

Just to review:

- the inputs control the scaleType small/medium/large.
- the scale variable reacts to any change to the scaleType.
- we pass the scale value into our mesh’s scale array.

### STEP 3: Smooth Transitions

Right now our mesh jumps directly from one scale to another, and what we’d like to see is a smooth transition. When we go from small (.5) to large (1.75) we’d like that to take about 2 seconds and progress through a handful of values in ```between``` the current scale and the next scale. Svelte provides something called a ```tweened store``` for just this type of thing! https://svelte.dev/tutorial/tweened

A tweened store is like a fancy variable that we can give a value, say 1. When we update that value to, say 1.75, the store value will shift to that value over time based on how we configure it. Let’s see what that looks like by updating our ```scale``` to be a tweened store and seeing what breaks:

```
...
  import { tweened } from "svelte/motion";
  let scale = tweened(1);
...
```
containers/app/threejs/src/routes/octo.svelte

Everything is broken! That’s because tweened stores are fancy variables (they’re actually just objects) and we need to access them in a special way [more info here](https://svelte.dev/tutorial/writable-stores). The shorthand way for reading and writing the value of a svelte store is with the ```$``` prefix. So everywhere we read or write to scale needs to be updated to ```$scale```:

Inside our reactive statement:

```
...
// reactive statement
$: if (scaleType === "SMALL"){
    $scale = .25;
} else if (scaleType === "MEDIUM"){
    $scale = 1;
} else if (scaleType === "LARGE") {
    $scale = 1.75;
}
...
```
containers/app/threejs/src/routes/octo.svelte

And inside our mesh:

```
...
 <SC.Mesh
    geometry={new THREE.OctahedronGeometry()}
    material={new THREE.MeshStandardMaterial({
      color: new THREE.Color('salmon')
    })}
    rotation={[rotate, rotate, rotate]}
    scale={[$scale, $scale, $scale]}
  />
...
```
containers/app/threejs/src/routes/octo.svelte

Now look at that transition! It will go smoothly.

### Customizing Transitions

That’s a smooth transition, but you know what would make it even better? Changing the duration and the easing. Well that’s just the second argument to a tweened store! And of course Svelte provides [a ton of great easing functions](https://svelte.dev/examples/easing) out of the box. I’ll use one here, but you should definitely play around with different options!

```
...
  import { elasticOut } from "svelte/easing";
  let scale = tweened(1, { duration: 2000, easing: elasticOut });
...
```
containers/app/threejs/src/routes/octo.svelte

In the next section we’ll cover animation accessibility concerns and how to use ```prefers-reduced-motion``` to avoid using animations for users who don’t want them, and how to accommodate screens with varying frame-rates so your animations can look consistent across devices.

## Svelte-Cubed: Creating an Accessible and Consistent Experience Across Devices

In this section, we’re going to look at two sort-of unrelated topics. However, both fall under the umbrella of improving user experience:

- Using ```prefers-reduced-motion``` to conditionally animate/transition things in our scene.

- Using threejs clock and ```getDelta()``` to render the same motion for users with different device frame rates.

### Conditional Motion: prefers-reduced-motion

Why does it matter?

*Not everyone likes decorative animations or transitions, and some users outright experience motion sickness when faced with parallax scrolling, zooming effects, and so on. The user preference media query prefers-reduced-motion lets you design a motion-reduced variant of your site for users who have expressed this preference.*

- Thomas Steiner ([twitter](https://twitter.com/tomayac)) in [prefers-reduced-motion: Sometimes less movement is more](https://web.dev/prefers-reduced-motion/)

And we want our scenes to be enjoyable for everyone, so first let’s figure out how to detect this preference in JavaScript so we can use it in our Svelte component. I’ll be using an approach from Geoff Rich ([twitter](https://twitter.com/geoffrich_)) explained in his post [A Svelte store for prefers-reduced-motion](https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/).

In a new javascript file we’ll call ```reducedMotion.js``` we can steal all of Geoff’s code (and cite it for future reference!) and paste it in.

```
import { readable } from "svelte/store";

/*
    Source: Geoff Rich, 
    "A Svelte store for prefers-reduced-motion", 
    URL: https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
*/
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

const getInitialMotionPreference = () => window.matchMedia(reducedMotionQuery).matches;

export const reducedMotion = readable(getInitialMotionPreference(), set => {
  const updateMotionPreference = event => {
    set(event.matches);
  };

  const mediaQueryList = window.matchMedia(reducedMotionQuery);
  mediaQueryList.addEventListener('change', updateMotionPreference);

  return () => {
    mediaQueryList.removeEventListener('change', updateMotionPreference);
  };
});
```
containers/app/threejs/src/lib/stores.js

**WARNING**: the above code may cause the following error when starting in a browser window: ```ReferenceError: window is not defined```. If so read https://www.okupter.com/blog/sveltekit-window-is-not-defined

Our work-around for above error:

```
...
import { browser } from '$app/environment';

if (browser) {
  // all rest of code goes here
}
...
```
containers/app/threejs/src/lib/stores.js

**NOTE**: The above is still causing errors, hence we skip the feature all together for now...

The ```reducedMotion``` store provides a boolean that we can subscribe and react to anywhere in our application if the value changes. How can we use it? Well, anywhere we animate we can first check the preference and adjust as needed. Our motion is coming from two sources: the tweened store and our ```SC.onFrame()``` callback.

**First**: if a user *prefers* reduced motion, our tweened store duration will be 0 (i.e. it will go from value a to value b instantly).

```
...
  import { reducedMotion } from "../lib/stores";
  let scale = tweened(1, { duration: $reducedMotion ? 0: 2000, easing: elasticOut });
...    
```
containers/app/threejs/src/routes/octo.svelte

That’s it? That’s it!

**Second**: if a user *does not* prefer reduced motion, we can update the rotation on every frame.

```
...
  if(!$reducedMotion){
    SC.onFrame(() => {
      rotate += .01;
    })
  }
...
```
containers/app/threejs/src/routes/octo.svelte

## Handling Variable Frame Rates Across Devices

What do all those words mean? Much smarter people can explain it better than me, but I’ll take a shot and then point you to a better explanation.

Some computer/monitor setups have powerful graphics and some do not. For example, our Octahedron is rotating 0.1 radians on each frame. So a setup running at 60 frames per second (fps) is watching your Octahedron rotate 0.1 radians 60 times every second. A less powerful setup running at 30fps is watching your Octahedron rotate 0.1 radians only 30 times every second. Those are very different experiences!

For a more accurate and in-depth explanation checkout [The Animation Loop](https://discoverthreejs.com/book/first-steps/animation-loop/#fixed-and-dynamic-frames) chapter from the open source book *Discover three.js* by Lewy Blue ([twitter](https://twitter.com/lewy_blue)). If you are new to three.js I highly recommend taking some time to go through the whole book!

Basically we need a way to standardize our hardcoded value inside ```SC.onFrame``` based on the current frame rate. We can do just that using the threejs Clock and the method ```getDelta()``` and multiplying our value by delta.

```
...
  const clock = new THREE.Clock();
  ...
  SC.onFrame(() => {
    rotate += .01 * clock.getDelta();
  })
...
```
containers/app/threejs/src/routes/octo.svelte

Wow, that’s slow. But it’s slow for everyone! Now we can adjust our rotation value to get the rate we want (try 0.5).


## Building a Master Detail App with Svelte

Based on "Building a Master Detail App with Svelte" at https://docs.nativescript.org/tutorials/build-a-master-detail-app-with-svelte

### Create the home page​
Let's start with creating the file for our home page with the following contents:

```
<page></page>

<script></script>
```
containers/app/threejs/scr/routes/home.svelte

### Routing setup​
We will be setting up the home page as our default route when the app starts. We can set the default route by importing the home component in our +page.svelte file and setting it as the defaultPage of the root's frame component. Open +page.svelte and add the following code:

```
...
<script>
  ...
  import Home from "./home.svelte";
  ...
</script>  
...
<page>
  <frame id="rootFrame" defaultPage="{Home}"></frame>
</page>
...
```
containers/app/threejs/scr/routes/+page.svelte

### Home UI​
Before we create the UI of our home page, let's create our ```FlickModel`````` and ```FlickService`````` first. This will allow us to use the data directly in our template.

```FlickModel``` will contain the shape of each flick object. Create a ```models``` directory inside ```src``` and create a new file called ```flick.ts``````. Open the new ```flick.ts``` and add the following interface:

```
export interface FlickModel {
  id: number
  genre: string
  title: string
  image: string
  url: string
  description: string
  details: {
    title: string
    body: string
  }[]
}
```
containers/app/threejs/scr/models/flick.ts

We will then use the ```FlickModel``` in our ```FlickService``` to return our flick data. Create a ```services``` directory inside ```src``` and create a new file called ```flickService.ts```. Open the new ```flickService.ts``` and add the following:

```
import type { FlickModel } from '../models/flick'

export class FlickService {
  private flicks: FlickModel[] = [
    {
      id: 1,
      genre: 'Musical',
      title: 'Book of Mormon',
      image: '~/assets/bookofmormon.png',
      url: 'https://nativescript.org/images/ngconf/book-of-mormon.mov',
      description: `A satirical examination of the beliefs and practices of The Church of Jesus Christ of Latter-day Saints.`,
      details: [
        {
          title: 'Music, Lyrics and Book by',
          body: 'Trey Parker, Robert Lopez, and Matt Stone',
        },
        {
          title: 'First showing on Broadway',
          body: 'March 2011 after nearly seven years of development.',
        },
        {
          title: 'Revenue',
          body: 'Grossed over $500 million, making it one of the most successful musicals of all time.',
        },
        {
          title: 'History',
          body: 'The Book of Mormon was conceived by Trey Parker, Matt Stone and Robert Lopez. Parker and Stone grew up in Colorado, and were familiar with The Church of Jesus Christ of Latter-day Saints and its members. They became friends at the University of Colorado Boulder and collaborated on a musical film, Cannibal! The Musical (1993), their first experience with movie musicals. In 1997, they created the TV series South Park for Comedy Central and in 1999, the musical film South Park: Bigger, Longer & Uncut. The two had first thought of a fictionalized Joseph Smith, religious leader and founder of the Latter Day Saint movement, while working on an aborted Fox series about historical characters. Their 1997 film, Orgazmo, and a 2003 episode of South Park, "All About Mormons", both gave comic treatment to Mormonism. Smith was also included as one of South Park\'s "Super Best Friends", a Justice League parody team of religious figures like Jesus and Buddha.',
        },
        {
          title: 'Development',
          body: `During the summer of 2003, Parker and Stone flew to New York City to discuss the script of their new film, Team America: World Police, with friend and producer Scott Rudin (who also produced South Park: Bigger, Longer & Uncut). Rudin advised the duo to see the musical Avenue Q on Broadway, finding the cast of marionettes in Team America similar to the puppets of Avenue Q. Parker and Stone went to see the production during that summer and the writer-composers of Avenue Q, Lopez and Jeff Marx, noticed them in the audience and introduced themselves. Lopez revealed that South Park: Bigger, Longer & Uncut was highly influential in the creation of Avenue Q. The quartet went for drinks afterwards, and soon found that each camp wanted to write something involving Joseph Smith. The four began working out details nearly immediately, with the idea to create a modern story formulated early on. For research purposes, the quartet took a road trip to Salt Lake City where they "interviewed a bunch of missionaries—or ex-missionaries." They had to work around Parker and Stone\'s South Park schedule. In 2006, Parker and Stone flew to London where they spent three weeks with Lopez, who was working on the West End production of Avenue Q. There, the three wrote "four or five songs" and came up with the basic idea of the story. After an argument between Parker and Marx, who felt he was not getting enough creative control, Marx was separated from the project.[10] For the next few years, the remaining trio met frequently to develop what they initially called The Book of Mormon: The Musical of the Church of Jesus Christ of Latter-day Saints. "There was a lot of hopping back and forth between L.A. and New York," Parker recalled.`,
        },
      ],
    },
    {
      id: 2,
      genre: 'Musical',
      title: 'Beetlejuice',
      image: '~/assets/beetlejuicemusical.png',
      url: 'https://nativescript.org/images/ngconf/beetlejuice.mov',
      description: `A deceased couple looks for help from a devious bio-exorcist to handle their haunted house.`,
      details: [
        {
          title: 'Music and Lyrics',
          body: 'Eddie Perfect',
        },
        {
          title: 'Book by',
          body: 'Scott Brown and Anthony King',
        },
        {
          title: 'Based on',
          body: 'A 1988 film of the same name.',
        },
        {
          title: 'First showing on Broadway',
          body: 'April 25, 2019',
        },
        {
          title: 'Background',
          body: `In 2016, a musical adaptation of the 1988 film Beetlejuice (directed by Tim Burton and starring Geena Davis as Barbara Maitland, Alec Baldwin as Adam Maitland, Winona Ryder as Lydia Deetz and Michael Keaton as Betelgeuse) was reported to be in the works, directed by Alex Timbers and produced by Warner Bros., following a reading with Christopher Fitzgerald in the title role. In March 2017, it was reported that Australian musical comedian Eddie Perfect would be writing the music and lyrics and Scott Brown and Anthony King would be writing the book of the musical, and that another reading would take place in May, featuring Kris Kukul as musical director. The musical has had three readings and two laboratory workshops with Alex Brightman in the title role, Sophia Anne Caruso as Lydia Deetz, Kerry Butler and Rob McClure as Barbara and Adam Maitland.`,
        },
      ],
    },
    {
      id: 3,
      genre: 'Musical',
      title: 'Anastasia',
      image: '~/assets/anastasia.png',
      url: 'https://nativescript.org/images/ngconf/anastasia.mov',
      description: `The legend of Grand Duchess Anastasia Nikolaevna of Russia.`,
      details: [
        { title: 'Music and Lyrics', body: 'Lynn Ahrens and Stephen Flaherty' },
        {
          title: 'Book by',
          body: 'Terrence McNally',
        },
        {
          title: 'Based on',
          body: 'A 1997 film of the same name.',
        },
        {
          title: 'Background',
          body: `A reading was held in 2012, featuring Kelli Barret as Anya (Anastasia), Aaron Tveit as Dmitry, Patrick Page as Vladimir, and Angela Lansbury as the Empress Maria. A workshop was held on June 12, 2015, in New York City, and included Elena Shaddow as Anya, Ramin Karimloo as Gleb Vaganov, a new role, and Douglas Sills as Vlad.
        The original stage production of Anastasia premiered at the Hartford Stage in Hartford, Connecticut on May 13, 2016 (previews). The show was directed by Darko Tresnjak and choreography by Peggy Hickey, with Christy Altomare and Derek Klena starring as Anya and Dmitry, respectively.
        Director Tresnjak explained: "We've kept, I think, six songs from the movie, but there are 16 new numbers. We've kept the best parts of the animated movie, but it really is a new musical." The musical also adds characters not in the film. Additionally, Act 1 is set in Russia and Act 2 in Paris, "which was everything modern Soviet Russia was not: free, expressive, creative, no barriers," according to McNally.
        The musical also omits the supernatural elements from the original film, including the character of Rasputin and his musical number "In the Dark of the Night", (although that song’s melody is repurposed in the new number "Stay, I Pray You"), and introduces instead a new villain called Gleb, a general for the Bolsheviks who receives orders to kill Anya.`,
        },
      ],
    },
  ]

  static getInstance(): FlickService {
    return FlickService._instance
  }

  private static _instance: FlickService = new FlickService()

  getFlicks(): FlickModel[] {
    return this.flicks
  }

  getFlickById(id: number): FlickModel | undefined {
    return this.flicks.find((flick) => flick.id === id) || undefined
  }
}
```
containers/app/threejs/scr/services/flickService.ts

**NOTE**: If you get the following error: ```This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'.ts(1371)```. Have a look at https://johnnyreilly.com/typescript-5-importsnotusedasvalues-error-eslint-consistent-type-imports

Add a ```/src/assets/``` directory to your project, and copy the 3 static images over from the sample project [here](https://github.com/NativeScript/tutorials/tree/main/svelte-tutorial/app/assets).

Next, let's break down the layout and UI elements of the home page.

![tutorial-example-app-master-breakdown db63775e](https://github.com/vanHeemstraSystems/threejs-collada-gltf/assets/1499433/e1718194-d90c-4c5a-b73c-96e77c1d60f1)

The home page can be divided into two main parts, the ActionBar with the title and the scrollable main content area with the cards (we will talk about the cards in the next section). Let's start with creating the ActionBar with the title. Open ```home.svelte``` and add the following code:

```
<page>
  <actionBar title="NativeFlix" />
</page>
<script></script>
```
containers/app/threejs/scr/routes/home.svelte



==== WE ARE HERE  ===


Next, we need to import our glTF model of the Lego baseplate...

**NOTE**: Is it possible to Load models (GLTF, obj, FBX or similar) into SvelteCubed? if so, how? Absolutely! Svelte Cubed has a ```<SC.Primitive />``` element you can use to drop any 3d object into. You would use threejs GLTFLoader like usual, and then just pass it to the element like ```<SC.Primitive object={myGLTFScene} />```

For reference, you can add glTF models and see what the the svelte-cubed code looks like using this tool (disclosure, I made it for just this purpose!): [sc3-lab.netlify.app](sc3-lab.netlify.app)

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

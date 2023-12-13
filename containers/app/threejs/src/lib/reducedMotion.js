import { readable } from "svelte/store";
//import { browser } from '$app/environment';
import { onMount } from 'svelte';

/*
    Source: Geoff Rich, 
    "A Svelte store for prefers-reduced-motion", 
    URL: https://geoffrich.net/posts/svelte-prefers-reduced-motion-store/
*/

onMount(() => {
  const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

  //if (browser) {
  const getInitialMotionPreference = () => window.matchMedia(reducedMotionQuery).matches;
  //}

  export const reducedMotion = readable(getInitialMotionPreference(), set => {
    const updateMotionPreference = event => {
      set(event.matches);
    };
    //if (browser) {
    const mediaQueryList = window.matchMedia(reducedMotionQuery);
    //}
    mediaQueryList.addEventListener('change', updateMotionPreference);

    return () => {
      mediaQueryList.removeEventListener('change', updateMotionPreference);
    };
  });
});
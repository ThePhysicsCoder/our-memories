// OUR LITTLE CAMPUS
// Scene transitions, URL navigation, the interactive memory map, and the photo galleries.
// Every animation itself is handled by CSS; JS handles flow, data and interaction.
//
// Flow:  Opening → Arrival → Entrance photo → Memory map → Location card → Gallery → Photograph
// URL:   #opening  #arrival  #gate  #map  #location/<id>  #gallery/<id>  #gallery/<id>/<photo number>

(() => {
  // Shown in the console, and in the on-screen message if a gallery is ever not found.
  // If you see an older name than this one, the browser is running an old script.js.
  const BUILD = 'gallery-6';
  console.info('[Our Little Campus] script build:', BUILD);

  // ==========================================================
  // 1. MEMORY DATA
  //    To add a new place later: copy one object, change the fields.
  //    `id` is also its URL:  #location/<id>   (keep ids unique, lowercase)
  //    x / y are percentages of the 1600 x 1000 map world.
  //    `card` places the little photo card relative to the pin (px).
  //    `label` is the side the name tag sits on: "right" | "left" | "top".
  //    `image` is the thumbnail shown on the map card and in the memory
  //    panel. It is the ONLY place thumbnail paths are set.
  //    `imageAlt` is the description read aloud for that image.
  //    `memories` is where the full memory content will live later.
  //    The art for a new place (building, trees...) can be added in the SVG.
  // ==========================================================

  const locations = [
    {
      id: 'nit-puducherry',
      title: 'NIT Puducherry',
      category: 'campus',
      x: 18, y: 60,
      label: 'right',
      card: { dx: -150, dy: -6, rot: -4 },
      tagline: 'Where it all happened.',
      description: 'Placeholder: a short memory about the campus entrance will go here.',
      image: 'assets/photos/campus-entrance.webp',
      imageAlt: 'The main entrance gate of NIT Puducherry',
      memories: []
    },
    {
      id: 'ganesha-temple',
      title: 'Ganesha Temple',
      category: 'campus',
      x: 44, y: 17,
      label: 'right',
      card: { dx: -140, dy: -26, rot: 3 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about the Ganesha Temple will go here.',
      image: 'assets/photos/ganesha-temple.webp',
      imageAlt: 'The Ganesha Temple on the NIT Puducherry campus',
      memories: []
    },
    {
      id: 'classroom',
      title: 'Classroom',
      category: 'campus',
      x: 70, y: 24,
      label: 'left',
      card: { dx: 150, dy: -40, rot: 4 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about the Classroom will go here.',
      image: 'assets/photos/class-room.webp',
      imageAlt: 'A classroom at NIT Puducherry',
      memories: []
    },
    {
      id: 'library',
      title: 'Library',
      category: 'campus',
      x: 47, y: 38,
      label: 'right',
      card: { dx: -150, dy: -40, rot: -3 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about the Library will go here.',
      image: 'assets/photos/library.webp',
      imageAlt: 'The library at NIT Puducherry',
      memories: []
    },
    {
      id: 'campus-roads',
      title: 'Campus Roads',
      category: 'campus',
      x: 40, y: 79,
      label: 'right',
      card: { dx: -140, dy: -66, rot: 3 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about the Campus Roads will go here.',
      image: 'assets/photos/nit-roads.webp',
      imageAlt: 'A road on the NIT Puducherry campus',
      memories: []
    },
    {
      id: 'rakshans-house',
      title: "Rakshan's House",
      category: 'campus',
      x: 80, y: 47,
      label: 'left',
      card: { dx: 140, dy: -10, rot: -3 },
      tagline: 'A memory lives here.',
      description: "Placeholder: a short memory about Rakshan's House will go here.",
      image: 'assets/photos/rakshan_house.webp',
      imageAlt: "Rakshan's House",
      memories: []
    },
    {
      id: 'ike-beach',
      title: 'Beach',
      category: 'beyond',
      x: 12.5, y: 84.5,
      label: 'right',
      card: { dx: -120, dy: 10, rot: 4 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about Beach will go here.',
      image: 'assets/photos/beach.webp',          // map thumbnail (unchanged)
      imageAlt: 'Beach by the sea',
      memories: []
    },
    {
      id: 'other-memories',
      title: 'Other Memories',
      category: 'beyond',
      x: 45, y: 91.2,
      label: 'right',
      card: { dx: -150, dy: -40, rot: -4 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short note about the Other Memories will go here.',
      image: 'assets/photos/others.webp',
      imageAlt: 'Other memories from our time at NIT Puducherry',
      memories: []
    },
    {
      id: 'nit-trichy-event',
      title: 'NIT Trichy Event',
      category: 'beyond',
      x: 84, y: 89,
      label: 'left',
      card: { dx: 140, dy: -40, rot: 3 },
      tagline: 'A memory lives here.',
      description: 'Placeholder: a short memory about the NIT Trichy Event will go here.',
      image: 'assets/photos/nit-trichy-event.webp',   // map thumbnail (unchanged)
      imageAlt: 'The NIT Trichy event',
      memories: []
    }
  ];

  // The two emotional regions of the map
  const regions = [
    { text: 'Inside campus',     x: 14, y: 8 },
    { text: 'Beyond the campus', x: 62.5, y: 88 }
  ];

  const WORLD = { width: 1600, height: 1000 };

  // ==========================================================
  // 1b. GALLERIES
  //     A place gets a gallery by having an entry here whose key
  //     matches its location id. VIEW MEMORIES then opens it.
  //
  //     HOW FILES ARE FOUND (read this before adding photos/videos)
  //     A browser cannot list a folder on a static site, so the gallery
  //     looks for NUMBERED file names instead:
  //         <prefix><two digits>.<ext>   →   nit01.webp, nit02.webp, ...
  //     It checks the numbers in groups of 8 and stops after a group in
  //     which nothing was found. So to add photos or videos you only have
  //     to drop in the next number (nit11.webp, nit03.mp4 ...). Nothing
  //     else needs editing, as long as the numbers have no gap of 8 or more.
  //
  //     Files with any other name can be registered by hand in
  //     `extraPhotos` / `videos.extra` using the full path, for example
  //         extraPhotos: ['assets/photos/nittichy/stage.webp']
  //     They appear after the numbered ones. Each is checked first, so a
  //     wrong path never shows a broken picture.
  //
  //     `captions` is optional, keyed by photo number:  { 3: 'Your caption' }
  //     Use lowercase file names and extensions exactly as configured here.
  // ==========================================================

  // One short helper builds a gallery from a folder name and a file prefix,
  // so adding a place later is a few lines. Paths and names it expects:
  //   photos:  assets/photos/<photoFolder>/<prefix>01.webp, <prefix>02.webp, ...
  //   videos:  assets/videos/<videoFolder>/<prefix>01.mp4,  <prefix>02.mp4,  ...
  // (videoFolder defaults to photoFolder.)
  function galleryFor(options) {
    const folder = options.videoFolder || options.photoFolder;

    return {
      title: options.title,
      subtitle: options.subtitle,
      enabled: options.enabled !== false,     // false = prepared, but not opened yet
      photoDirs: ['assets/photos/' + options.photoFolder + '/'],
      photoPrefix: options.prefix,
      photoExt: 'webp',
      photoMax: 99,
      extraPhotos: [],                        // odd file names: full paths, e.g. 'assets/photos/x/stage.webp'
      captions: options.captions || {},       // optional, by photo number: { 3: 'Your caption' }
      videos: {
        title: options.videoTitle || 'Moments in Motion',
        dirs: ['assets/videos/' + folder + '/'],
        prefix: options.prefix,
        ext: 'mp4',
        max: 40,
        extra: []                             // odd file names: full paths
      }
    };
  }

  const GALLERIES = {
    // ----- Connected -----
    'ike-beach': galleryFor({
      title: 'Ike Beach',
      subtitle: 'A little collection of moments by the sea.',
      photoFolder: 'beach', prefix: 'beach',
      videoTitle: 'A Moment in Motion'
    }),

    'nit-trichy-event': galleryFor({
      title: 'NIT Trichy Event',
      subtitle: 'A little collection of moments from the event.',
      photoFolder: 'nittichy', prefix: 'nit'
    }),

    'library': galleryFor({
      title: 'Library',
      subtitle: 'A little collection of moments among the books.',
      photoFolder: 'library', prefix: 'library'
    }),

    'campus-roads': galleryFor({
      title: 'Campus Roads',
      subtitle: 'A little collection of moments along the roads.',
      photoFolder: 'roads', prefix: 'roads'
    }),

    // Ready for its media. Until the folders exist, the gallery opens with a gentle
    // "nothing here yet" note instead of broken pictures.
    'rakshans-house': galleryFor({
      title: "Rakshan's House",
      subtitle: 'A little collection of moments at Rakshan\u2019s house.',
      photoFolder: 'rakshan', prefix: 'rakshan'
    }),

    // ----- Prepared, not opened yet -----
    // Their folders are not uploaded, so VIEW MEMORIES still shows the
    // "on their way" note. To open one: upload the files, then delete its
    // `enabled: false` line (or change it to true).
    'ganesha-temple': galleryFor({
      enabled: true,
      title: 'Ganesha Temple',
      subtitle: 'A little collection of moments at the temple.',
      photoFolder: 'ganesha_temple', prefix: 'ganesha_temple'
    }),

    'classroom': galleryFor({
      enabled: true,
      title: 'Classroom',
      subtitle: 'A little collection of moments in the classroom.',
      photoFolder: 'classroom', prefix: 'classroom'
    }),

    'other-memories': galleryFor({
      enabled: true,
      title: 'Other Memories',
      subtitle: 'A little collection of moments that belong everywhere.',
      photoFolder: 'others', prefix: 'others'
    })
  };

  // A place opens its gallery only if it has an entry that is switched on
  const hasGallery = (id) =>
    Object.prototype.hasOwnProperty.call(GALLERIES, id) && GALLERIES[id].enabled !== false;

  // ==========================================================
  // 2. ELEMENTS
  // ==========================================================

  const scene = document.getElementById('scene');
  const arrival = document.getElementById('arrival');
  const entrance = document.getElementById('entrance');
  const mapScene = document.getElementById('map');
  const galleryScene = document.getElementById('gallery');
  const gameScene = document.getElementById('memory-game');
  const photo = document.getElementById('entrance-photo');

  const enterButton = document.getElementById('enter-button');
  const guessMemoryButton = document.getElementById('guess-memory-button');
  const walkInButton = document.getElementById('walk-in-button');
  const enterCampusButton = document.getElementById('enter-campus-button');

  const viewport = document.getElementById('map-viewport');
  const world = document.getElementById('map-world');

  if (!scene || !arrival || !entrance || !mapScene || !galleryScene || !gameScene || !photo || !viewport || !world ||
      !enterButton || !guessMemoryButton || !walkInButton || !enterCampusButton) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ==========================================================
  // 3. SCENES + URL NAVIGATION
  //
  //  The URL hash is the single source of truth for "where am I":
  //    #opening  #arrival  #gate  #map  #location/<id>
  //    #gallery/<id>   #gallery/<id>/<photo number>
  //  Every scene change goes through navigate(), which updates the
  //  URL and then calls applyRoute(). Refresh, Back and Forward all
  //  funnel into syncFromUrl(), which reads the URL and does the same.
  // ==========================================================

  const TIMING = {
    normal: {
      reveal: 2200,       // opening has faded; arrival starts to appear
      cleanup: 5200,      // arrival fully visible; opening can be removed
      dissolve: 3400,     // arrival dissolved; it can be removed
      mapReveal: 1800,    // entrance has gone dark; map starts to rise
      mapCleanup: 5000,   // map fully visible; entrance can be removed
      galleryLeave: 700   // gallery has faded; it can be removed
    },
    reduced: {
      reveal: 60,
      cleanup: 200,
      dissolve: 100,
      mapReveal: 60,
      mapCleanup: 200,
      galleryLeave: 0
    }
  };

  const currentTiming = () => (reduceMotion.matches ? TIMING.reduced : TIMING.normal);

  // ---------- Timers for the animated transitions ----------
  // Any new navigation cancels the previous transition's pending steps.

  let timers = [];

  function later(fn, ms) {
    timers.push(window.setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  }

  // ---------- Entrance photograph: loaded quietly ----------

  function loadPhoto() {
    if (photo.getAttribute('src')) return;

    const source = photo.dataset.src;
    const probe = new Image();

    probe.onload = () => {
      photo.src = source;
      const reveal = () => photo.classList.add('is-loaded');
      if (photo.decode) {
        photo.decode().then(reveal, reveal);
      } else {
        reveal();
      }
    };

    probe.onerror = () => {
      console.warn('Could not load ' + source + '. Check that the file exists in assets/photos/.');
    };

    probe.src = source;
  }

  // ---------- Showing and hiding scenes ----------

  // Fully hide a scene and reset it, so it replays from the start next time
  function retire(el) {
    el.classList.remove('is-active', 'is-leaving');
    el.hidden = true;
    el.inert = true;
  }

  // Show a scene. Returns true if it was freshly shown, false if it was already visible.
  function present(el) {
    if (!el.hidden) {
      el.classList.remove('is-leaving');
      el.classList.add('is-active');
      el.inert = false;
      return false;
    }

    el.classList.remove('is-active', 'is-leaving');
    el.hidden = false;
    el.inert = false;
    void el.offsetWidth;                 // so the fade-in starts from the beginning
    el.classList.add('is-active');
    return true;
  }

  // ----- Instant states (refresh, Back/Forward, direct links) -----

  function showOpeningNow() {
    retire(arrival);
    retire(entrance);
    retire(mapScene);

    const restoring = document.documentElement.classList.contains('is-restoring');
    scene.classList.remove('is-leaving');

    if (scene.hidden || restoring) {
      scene.hidden = true;
      void scene.offsetWidth;
      scene.hidden = false;              // restarts the opening sequence from the beginning
    }
    scene.inert = false;
  }

  function showArrivalNow() {
    retire(scene);
    retire(entrance);
    retire(mapScene);

    present(arrival);
    arrival.focus({ preventScroll: true });
    loadPhoto();                         // get the next scene's photograph ready
  }

  function showGateNow() {
    retire(scene);
    retire(arrival);
    retire(mapScene);

    loadPhoto();
    present(entrance);
    entrance.focus({ preventScroll: true });
  }

  function revealMap(options) {
    const fresh = present(mapScene);
    if (fresh) {
      memoryMap.show(options);           // measure + set the starting view
      mapScene.focus({ preventScroll: true });
    }
  }

  function showMapNow(options) {
    retire(scene);
    retire(arrival);
    retire(entrance);
    revealMap(options);
  }

  // Leaving the gallery for the map: fade it away, keep the map exactly as it was
  function leaveGallery() {
    galleryModule.hide();
    galleryScene.inert = true;
    galleryScene.classList.add('is-leaving');

    mapScene.inert = false;
    mapScene.focus({ preventScroll: true });

    later(() => retire(galleryScene), currentTiming().galleryLeave);
  }

  // ----- Animated transitions (the original cinematic ones) -----

  // Opening → Arrival
  function transitionToArrival() {
    const timing = currentTiming();

    scene.classList.add('is-leaving');

    later(() => {
      present(arrival);
      arrival.focus({ preventScroll: true });
      loadPhoto();
    }, timing.reveal);

    later(() => retire(scene), timing.cleanup);
  }

  // Arrival → Entrance photograph
  function transitionToGate() {
    const timing = currentTiming();

    loadPhoto();

    // The photograph waits underneath, and the illustrated world dissolves on top of it
    present(entrance);
    arrival.inert = true;
    arrival.classList.add('is-leaving');
    entrance.focus({ preventScroll: true });

    later(() => retire(arrival), timing.dissolve);
  }

  // Entrance photograph → Map
  function transitionToMap() {
    const timing = currentTiming();

    // The photograph quietly goes dark, and the map rises out of it
    entrance.inert = true;
    entrance.classList.add('is-leaving');

    later(() => revealMap({ settle: true }), timing.mapReveal);
    later(() => retire(entrance), timing.mapCleanup);
  }

  // ---------- Routes ----------

  let currentKey = null;      // e.g. "map", "location/library", "gallery/ike-beach/3"
  let currentScene = null;    // "opening" | "arrival" | "gate" | "map" | "gallery"

  function makeRoute(name) {
    return { name, key: name };
  }

  // Turns a hash into a valid route. Never throws.
  function parseRoute(hash) {
    let raw = String(hash || '').replace(/^#\/?/, '').replace(/\/+$/, '');

    try {
      raw = decodeURIComponent(raw);
    } catch (err) {
      return makeRoute('opening');
    }

    raw = raw.trim().toLowerCase();

    if (raw === '' || raw === 'opening') return makeRoute('opening');
    if (raw === 'arrival' || raw === 'gate' || raw === 'map' || raw === 'game') return makeRoute(raw);

    if (raw.indexOf('location') === 0) {
      const match = raw.match(/^location\/([^/]+)$/);
      const place = match && locations.find((l) => l.id === match[1]);

      if (place) return { name: 'location', id: place.id, key: 'location/' + place.id };
      return makeRoute('map');           // unknown or missing place: show the map instead
    }

    if (raw.indexOf('gallery') === 0) {
      const match = raw.match(/^gallery\/([^/]+)(?:\/(\d+))?$/);

      if (match && hasGallery(match[1])) {
        const number = match[2] ? parseInt(match[2], 10) : 0;
        const base = 'gallery/' + match[1];
        return {
          name: 'gallery',
          id: match[1],
          photo: number,                 // 0 = just the gallery, otherwise that photograph is open
          key: number > 0 ? base + '/' + number : base
        };
      }
      return makeRoute('map');           // unknown gallery: show the map instead
    }

    return makeRoute('opening');         // anything else: start from the beginning
  }

  function updateTitle(route) {
    const base = 'Our Little Campus';

    if (route.name === 'location') {
      const place = locations.find((l) => l.id === route.id);
      document.title = place ? place.title + ' \u00B7 ' + base : base;
    } else if (route.name === 'gallery') {
      document.title = GALLERIES[route.id].title + ' \u00B7 Memories \u00B7 ' + base;
    } else if (route.name === 'map') {
      document.title = 'Memory Map \u00B7 ' + base;
    } else if (route.name === 'game') {
      document.title = 'Guess the Memory \u00B7 ' + base;
    } else {
      document.title = base;
    }
  }

  // Makes the screen match a route. Does NOT touch the URL.
  function applyRoute(route, options) {
    const animate = !!(options && options.animate);
    const from = currentScene;
    const target = route.name === 'location' ? 'map' : route.name;

    clearTimers();
    currentKey = route.key;
    currentScene = target;

    // Keep the game and gallery as separate views.
    if (target !== 'game') {
      gameModule.hide();
      retire(gameScene);
    }

    // Leaving the gallery (or never in it)
    if (target !== 'gallery') {
      galleryModule.hide();
      if (target === 'map') {
        if (!galleryScene.hidden) leaveGallery();
      } else {
        retire(galleryScene);
      }
    }

    // The location card stays open underneath the gallery, so Back returns to it
    if (target !== 'map' && target !== 'gallery') memoryMap.closePanel();

    if (target === 'opening') {
      showOpeningNow();

    } else if (target === 'game') {
      retire(scene);
      retire(arrival);
      retire(entrance);
      retire(mapScene);
      retire(galleryScene);
      present(gameScene);
      gameScene.focus({ preventScroll: true });
      gameModule.show();

    } else if (target === 'arrival') {
      if (animate && from === 'opening') transitionToArrival();
      else showArrivalNow();

    } else if (target === 'gate') {
      if (animate && from === 'arrival') transitionToGate();
      else showGateNow();

    } else if (target === 'gallery') {
      // Keep the map ready underneath, so BACK TO MAP is instant and keeps its view
      if (mapScene.hidden) {
        retire(scene);
        retire(arrival);
        retire(entrance);
        revealMap({ settle: false });
      }
      mapScene.inert = true;

      if (present(galleryScene)) galleryScene.focus({ preventScroll: true });
      galleryModule.show(route.id, route.photo);

    } else {
      // Map, or a location card on top of the map
      if (mapScene.hidden) {
        if (animate && from === 'gate' && route.name === 'map') {
          transitionToMap();
        } else {
          // Straight to the map. Skip the slow intro zoom if a card is about to open.
          showMapNow({ settle: route.name === 'map' });
        }
      }

      if (route.name === 'location') memoryMap.select(route.id);
      else memoryMap.closePanel();
    }

    updateTitle(route);
  }

  // Go somewhere new. Adds ONE history entry (nothing if we are already there).
  // { replace: true } swaps the current entry instead (used for photograph Next/Previous).
  function navigate(hash, options) {
    const route = parseRoute(hash);
    if (route.key === currentKey) return;

    const url = '#' + route.key;
    if (options && options.replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);

    applyRoute(route, { animate: !!(options && options.animate) });
  }

  // Read the URL and show it. Used on refresh, Back/Forward, and manual hash edits.
  function syncFromUrl() {
    const route = parseRoute(location.hash);
    const canonical = '#' + route.key;

    // Tidy up empty / invalid / differently-cased hashes without adding history
    if (location.hash !== canonical) history.replaceState(null, '', canonical);

    // popstate and hashchange can both fire for one change; render only once
    if (route.key === currentKey) return;

    applyRoute(route, { animate: false });
  }

  function initRouter() {
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);

    syncFromUrl();
    document.documentElement.classList.remove('is-restoring');
  }

  // ---------- Buttons that move the story forward ----------

  guessMemoryButton.addEventListener('click', () => {
    navigate('#game');
  });

  enterButton.addEventListener('click', () => {
    console.log('Entering Our Little Campus...');
    navigate('#arrival', { animate: true });
  });

  walkInButton.addEventListener('click', () => {
    console.log('Walking in...');
    navigate('#gate', { animate: true });
  });

  enterCampusButton.addEventListener('click', () => {
    console.log('Entering the campus...');
    navigate('#map', { animate: true });
  });

  // ==========================================================
  // 4. THE MEMORY MAP
  // ==========================================================

  const memoryMap = (() => {
    const W = WORLD.width;
    const H = WORLD.height;

    const regionLayer = document.getElementById('map-regions');
    const cardLayer = document.getElementById('map-cards');
    const markerLayer = document.getElementById('map-markers');

    const zoomInButton = document.getElementById('map-zoom-in');
    const zoomOutButton = document.getElementById('map-zoom-out');
    const resetButton = document.getElementById('map-reset');
    const backButton = document.getElementById('map-back');

    const panel = document.getElementById('memory-panel');
    const panelContent = document.getElementById('memory-content');
    const panelImg = document.getElementById('memory-img');
    const panelPlaceholder = document.getElementById('memory-placeholder');
    const panelCategory = document.getElementById('memory-category');
    const panelTitle = document.getElementById('memory-title');
    const panelTagline = document.getElementById('memory-tagline');
    const panelText = document.getElementById('memory-text');
    const panelCount = document.getElementById('memory-count');
    const panelNote = document.getElementById('memory-note');
    const closeButton = document.getElementById('memory-close');
    const viewButton = document.getElementById('memory-view');
    const prevButton = document.getElementById('memory-prev');
    const nextButton = document.getElementById('memory-next');

    const markerEls = new Map();
    const cardEls = new Map();

    const px = (loc) => ({ x: (loc.x / 100) * W, y: (loc.y / 100) * H });
    const clampNum = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const placeHash = (id) => '#location/' + id;

    // ---------- Building the map from the data ----------

    function buildRegions() {
      regions.forEach((region) => {
        const el = document.createElement('div');
        el.className = 'region';
        el.textContent = region.text;
        el.style.left = region.x + '%';
        el.style.top = region.y + '%';
        regionLayer.appendChild(el);
      });
    }

    function buildLocations() {
      locations.forEach((loc, i) => {
        const pos = px(loc);

        // Photo card (decorative; the marker is the accessible control)
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = loc.id;
        card.setAttribute('aria-hidden', 'true');
        card.style.left = (pos.x + loc.card.dx) + 'px';
        card.style.top = (pos.y + loc.card.dy) + 'px';
        card.style.setProperty('--rot', loc.card.rot + 'deg');
        card.style.setProperty('--i', i);

        const frame = document.createElement('span');
        frame.className = 'card__photo';
        if (loc.image) {
          const img = document.createElement('img');
          img.alt = '';
          img.decoding = 'async';

          // If the first attempt fails, try once more (skipping any cached failure)
          let retried = false;
          img.addEventListener('error', () => {
            if (!retried) {
              retried = true;
              img.src = loc.image + '?v=' + Date.now();
              return;
            }
            console.warn('Could not load ' + loc.image + ' (' + loc.title + ')');
            img.remove();
          });

          img.src = loc.image;
          frame.appendChild(img);
        }
        card.appendChild(frame);
        cardLayer.appendChild(card);
        cardEls.set(loc.id, card);

        // Marker (a real button)
        const marker = document.createElement('button');
        marker.type = 'button';
        marker.className = 'marker marker--' + loc.category + ' marker--' + loc.label;
        marker.dataset.id = loc.id;
        marker.style.left = loc.x + '%';
        marker.style.top = loc.y + '%';
        marker.style.setProperty('--i', i);
        marker.setAttribute('aria-label', loc.title);
        marker.setAttribute('aria-haspopup', 'dialog');
        marker.setAttribute('aria-expanded', 'false');
        marker.setAttribute('aria-controls', 'memory-panel');
        marker.innerHTML =
          '<span class="marker__glow" aria-hidden="true"></span>' +
          '<svg class="marker__pin" viewBox="0 0 24 32" aria-hidden="true" focusable="false">' +
            '<path d="M12 31C12 31 2 19.5 2 12a10 10 0 1 1 20 0c0 7.5-10 19-10 19z"/>' +
            '<circle cx="12" cy="12" r="3.6"/>' +
          '</svg>' +
          '<span class="marker__label" aria-hidden="true"></span>';
        marker.querySelector('.marker__label').textContent = loc.title;

        markerLayer.appendChild(marker);
        markerEls.set(loc.id, marker);
      });
    }

    // ---------- Generated illustration: trees and lamps ----------

    function mulberry32(seed) {
      return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }

    // Approximate y of the shoreline for a given x (the sea is below it, bottom-left)
    function shoreY(x) {
      if (x < 290) return 840 + (x / 290) * 100;
      if (x < 520) return 940 + ((x - 290) / 230) * 60;
      return 1000;
    }

    function buildTrees() {
      const group = document.getElementById('map-scatter');
      if (!group) return;

      const rand = mulberry32(2024);

      // Keep trees off the places and buildings
      const avoid = locations.map((loc) => ({ ...px(loc), r: 66 }));
      [[500, 236], [340, 372], [950, 170], [1010, 336], [940, 540], [520, 530],
       [1390, 340], [640, 610], [1160, 620], [410, 200], [1260, 150]]
        .forEach(([x, y]) => avoid.push({ x, y, r: 56 }));

      const fills = ['#0b140e', '#0d1810', '#101d14', '#0a120d'];
      let html = '';
      let placed = 0;

      for (let n = 0; n < 1600 && placed < 520; n++) {
        const x = rand() * W;
        const y = rand() * H;

        if (y > shoreY(x) - 8) continue;                 // not in the sea
        if (y > 740 && rand() < 0.55) continue;           // sparser beyond the campus
        if (avoid.some((a) => Math.hypot(a.x - x, a.y - y) < a.r)) continue;

        const r = 5 + rand() * 11;
        const fill = fills[Math.floor(rand() * fills.length)];
        html += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + fill + '"/>';

        if (rand() < 0.25) {
          html += '<circle cx="' + (x - r * 0.25).toFixed(1) + '" cy="' + (y - r * 0.3).toFixed(1) +
                  '" r="' + (r * 0.55).toFixed(1) + '" fill="#1f3322" opacity=".5"/>';
        }
        placed++;
      }

      group.innerHTML = html;
    }

    function buildLights() {
      const group = document.getElementById('map-lights');
      if (!group) return;

      const rand = mulberry32(77);
      // [path id, spacing, distance from the path]
      const sources = [
        ['road-main', 56, 18],
        ['road-low',  64, 15],
        ['route-1',   46, 8],
        ['route-2',   46, 8],
        ['route-3',   46, 8],
        ['route-5',   40, 8]
      ];

      let html = '';

      sources.forEach(([id, step, offset]) => {
        const path = document.getElementById(id);
        if (!path || !path.getTotalLength) return;

        const length = path.getTotalLength();

        for (let d = step * rand(); d < length; d += step * (0.75 + rand() * 0.5)) {
          const p = path.getPointAtLength(d);
          const q = path.getPointAtLength(Math.min(d + 1, length));
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const m = Math.hypot(dx, dy) || 1;
          const side = rand() < 0.5 ? -1 : 1;
          const x = p.x + (-dy / m) * offset * side;
          const y = p.y + (dx / m) * offset * side;

          if (x < 0 || x > W || y < 0 || y > H) continue;

          const twinkle = rand() < 0.2 ? ' class="twinkle" style="--d:-' + (rand() * 5).toFixed(1) + 's"' : '';
          html += '<g' + twinkle + '>' +
                    '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="7" fill="url(#g-lamp)" opacity=".5"/>' +
                    '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1.5" fill="#f0dca4" opacity="' + (0.5 + rand() * 0.5).toFixed(2) + '"/>' +
                  '</g>';
        }
      });

      group.innerHTML = html;
    }

    // ---------- View (pan / zoom) ----------

    const view = { x: 0, y: 0, k: 1 };
    let vw = 0;
    let vh = 0;
    let minK = 0.5;
    let maxK = 3;
    let glideTimer = 0;
    let started = false;       // has the starting view been set yet?

    function measure() {
      const rect = viewport.getBoundingClientRect();
      vw = rect.width;
      vh = rect.height;
      // "Cover": the world always fills the screen, so there are never empty edges
      minK = Math.max(vw / W, vh / H);
      maxK = Math.max(minK * 3, 2.2);
    }

    function clampView(v) {
      const k = clampNum(v.k, minK, maxK);
      return {
        k,
        x: clampNum(v.x, vw - W * k, 0),
        y: clampNum(v.y, vh - H * k, 0)
      };
    }

    function apply() {
      world.style.transform = 'translate3d(' + view.x + 'px,' + view.y + 'px,0) scale(' + view.k + ')';
      world.style.setProperty('--k', view.k.toFixed(4));
    }

    function setView(next) {
      Object.assign(view, clampView(next));
      apply();
    }

    function stopGlide() {
      if (!world.classList.contains('is-gliding')) return;

      // Freeze exactly where the glide currently is
      const m = new DOMMatrixReadOnly(getComputedStyle(world).transform);
      world.classList.remove('is-gliding');
      window.clearTimeout(glideTimer);
      setView({ x: m.m41, y: m.m42, k: m.m11 });
    }

    function glideTo(target, ms) {
      const next = clampView(target);

      if (reduceMotion.matches) {
        setView(next);
        return;
      }

      const duration = ms || 1200;
      world.style.setProperty('--glide', duration + 'ms');
      world.classList.add('is-gliding');
      Object.assign(view, next);
      apply();

      window.clearTimeout(glideTimer);
      glideTimer = window.setTimeout(() => world.classList.remove('is-gliding'), duration + 60);
    }

    function zoomAt(px_, py_, ratio) {
      const k = clampNum(view.k * ratio, minK, maxK);
      const r = k / view.k;
      setView({
        k,
        x: px_ - (px_ - view.x) * r,
        y: py_ - (py_ - view.y) * r
      });
    }

    // The part of the screen that is not covered by the memory panel
    function visibleArea() {
      if (panelOpen) {
        if (vw < 720) {
          const sheet = panel.offsetHeight;
          return { cx: vw / 2, cy: Math.max((vh - sheet) / 2, vh * 0.22) };
        }
        return { cx: (vw - panel.offsetWidth - 40) / 2, cy: vh / 2 };
      }
      return { cx: vw / 2, cy: vh / 2 };
    }

    function centerOnLocation(loc, ms) {
      const pos = px(loc);
      const area = visibleArea();
      const k = Math.min(maxK, Math.max(view.k, minK * (vw < 720 ? 1.5 : 1.35)));
      glideTo({
        k,
        x: area.cx - pos.x * k,
        y: area.cy - (pos.y - 24) * k
      }, ms);
    }

    // First time the map is shown. `settle` = the slow "stepping in" zoom.
    function startView(settle) {
      const narrow = vw < 720;
      const k = minK;
      const cx = narrow ? W * 0.33 : W * 0.5;
      const cy = narrow ? H * 0.52 : H * 0.5;
      const settled = clampView({ k, x: vw / 2 - cx * k, y: vh / 2 - cy * k });

      if (!settle || reduceMotion.matches) {
        setView(settled);
        return;
      }

      // Begin slightly closer, then slowly ease back, like stepping into the scene
      const k0 = Math.min(maxK, k * 1.12);
      setView({ k: k0, x: vw / 2 - cx * k0, y: vh / 2 - cy * k0 });
      void world.offsetWidth;
      glideTo(settled, 7000);
    }

    // ---------- Pointer interaction ----------

    const pointers = new Map();
    let drag = null;
    let pinch = null;
    let suppressClick = false;

    function quiet() {
      mapScene.classList.add('is-quiet');
    }

    function pinchState() {
      const pts = [...pointers.values()];
      return {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1,
        mx: (pts[0].x + pts[1].x) / 2,
        my: (pts[0].y + pts[1].y) / 2
      };
    }

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      stopGlide();
      quiet();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        drag = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
      } else if (pointers.size === 2) {
        drag = null;
        pinch = pinchState();
      }
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2 && pinch) {
        const now = pinchState();
        const rect = viewport.getBoundingClientRect();

        // Pan with the midpoint, zoom around it
        setView({ k: view.k, x: view.x + (now.mx - pinch.mx), y: view.y + (now.my - pinch.my) });
        zoomAt(now.mx - rect.left, now.my - rect.top, now.dist / pinch.dist);

        pinch = now;
        suppressClick = true;
        return;
      }

      if (drag) {
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;

        if (!drag.moved && Math.hypot(dx, dy) > 6) {
          drag.moved = true;
          viewport.setPointerCapture(e.pointerId);
          viewport.classList.add('is-dragging');
        }

        if (drag.moved) {
          setView({ k: view.k, x: drag.vx + dx, y: drag.vy + dy });
        }
      }
    });

    function endPointer(e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);

      if (drag && drag.moved) suppressClick = true;
      if (suppressClick) window.setTimeout(() => { suppressClick = false; }, 80);

      viewport.classList.remove('is-dragging');
      pinch = null;

      // If one finger remains after a pinch, let it keep panning
      if (pointers.size === 1) {
        const [p] = pointers.values();
        drag = { sx: p.x, sy: p.y, vx: view.x, vy: view.y, moved: true };
      } else {
        drag = null;
      }
    }

    viewport.addEventListener('pointerup', endPointer);
    viewport.addEventListener('pointercancel', endPointer);

    // A drag must never be mistaken for a tap on a place
    viewport.addEventListener('click', (e) => {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      stopGlide();
      quiet();

      const rect = viewport.getBoundingClientRect();

      if (!e.ctrlKey && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        setView({ k: view.k, x: view.x - e.deltaX, y: view.y });
        return;
      }

      const speed = e.ctrlKey ? 0.006 : 0.0015;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * speed));
    }, { passive: false });

    viewport.addEventListener('keydown', (e) => {
      if (e.target !== viewport) return;

      const stepPx = 90;
      let handled = true;
      quiet();
      stopGlide();

      switch (e.key) {
        case 'ArrowLeft':  setView({ k: view.k, x: view.x + stepPx, y: view.y }); break;
        case 'ArrowRight': setView({ k: view.k, x: view.x - stepPx, y: view.y }); break;
        case 'ArrowUp':    setView({ k: view.k, x: view.x, y: view.y + stepPx }); break;
        case 'ArrowDown':  setView({ k: view.k, x: view.x, y: view.y - stepPx }); break;
        case '+':
        case '=':          zoomAt(vw / 2, vh / 2, 1.2); break;
        case '-':
        case '_':          zoomAt(vw / 2, vh / 2, 1 / 1.2); break;
        case '0':          showWhole(); break;
        default:           handled = false;
      }

      if (handled) e.preventDefault();
    });

    function zoomBy(factor) {
      stopGlide();
      quiet();
      const k = clampNum(view.k * factor, minK, maxK);
      const r = k / view.k;
      glideTo({
        k,
        x: vw / 2 - (vw / 2 - view.x) * r,
        y: vh / 2 - (vh / 2 - view.y) * r
      }, 600);
    }

    function showWhole() {
      const k = minK;
      glideTo({ k, x: (vw - W * k) / 2, y: (vh - H * k) / 2 }, 1200);
    }

    zoomInButton.addEventListener('click', () => zoomBy(1.4));
    zoomOutButton.addEventListener('click', () => zoomBy(1 / 1.4));
    resetButton.addEventListener('click', showWhole);

    // Keyboard users tabbing between places: bring the focused place into view
    markerLayer.addEventListener('focusin', (e) => {
      const btn = e.target.closest('.marker');
      if (!btn) return;

      const loc = locations.find((l) => l.id === btn.dataset.id);
      const pos = px(loc);
      const sx = view.x + pos.x * view.k;
      const sy = view.y + pos.y * view.k;
      const edge = 70;

      if (sx < edge || sx > vw - edge || sy < edge + 50 || sy > vh - edge) {
        stopGlide();
        centerOnLocation(loc, 900);
      }
    });

    // ---------- The memory panel (shows a place; the URL decides which) ----------

    let currentId = null;
    let panelOpen = false;
    let noteTimer = 0;
    let returnFocusOnClose = false;

    function showPlaceholder() {
      panelImg.classList.remove('is-ready');
      panelImg.hidden = true;
      panelPlaceholder.hidden = false;
    }

    function fillPanel(loc, index) {
      panelCategory.textContent = loc.category === 'campus' ? 'Inside campus' : 'Beyond the campus';
      panelTitle.textContent = loc.title;
      panelTagline.textContent = loc.tagline;
      panelText.textContent = loc.description;
      panelCount.textContent = (index + 1) + ' / ' + locations.length;

      // Thumbnail: comes straight from the location data
      panelImg.classList.remove('is-ready');

      if (loc.image) {
        panelImg.onload = () => panelImg.classList.add('is-ready');
        panelImg.onerror = () => {
          console.warn('Could not load ' + loc.image + ' (' + loc.title + ')');
          showPlaceholder();
        };
        panelImg.src = loc.image;
        panelImg.alt = loc.imageAlt || loc.title;
        panelImg.hidden = false;
        panelPlaceholder.hidden = true;

        // Already cached (e.g. the same place re-opened): no load event will follow
        if (panelImg.complete && panelImg.naturalWidth) panelImg.classList.add('is-ready');
      } else {
        panelImg.onload = null;
        panelImg.onerror = null;
        panelImg.removeAttribute('src');
        panelImg.alt = '';
        showPlaceholder();
      }

      window.clearTimeout(noteTimer);
      panelNote.textContent = '';
    }

    function markSelected(id) {
      markerEls.forEach((el, key) => {
        const on = key === id;
        el.classList.toggle('is-selected', on);
        el.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      cardEls.forEach((el, key) => el.classList.toggle('is-selected', key === id));
    }

    // Open (or switch) the card for a place. Called by the router, never by a click directly.
    function select(id) {
      const index = locations.findIndex((l) => l.id === id);
      if (index < 0) return;

      const loc = locations[index];
      const wasOpen = panelOpen;
      const sameCard = wasOpen && currentId === id;

      stopGlide();
      quiet();
      currentId = id;
      markSelected(id);

      if (wasOpen && !sameCard) {
        // Switching places: the text softly changes
        panelContent.classList.add('is-changing');
        window.setTimeout(() => {
          fillPanel(loc, index);
          panelContent.classList.remove('is-changing');
        }, reduceMotion.matches ? 0 : 240);
      } else if (!wasOpen) {
        fillPanel(loc, index);
      }

      panelOpen = true;
      mapScene.classList.add('has-location');
      panel.inert = false;
      panel.setAttribute('aria-hidden', 'false');
      panel.classList.add('is-open');

      if (!wasOpen) panel.focus({ preventScroll: true });

      if (!sameCard) centerOnLocation(loc);
    }

    // Close the card. Called by the router, never by a click directly.
    function closePanel() {
      if (!panelOpen) return;

      const marker = markerEls.get(currentId);

      panelOpen = false;
      mapScene.classList.remove('has-location');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      panel.inert = true;

      currentId = null;
      markSelected(null);

      if (returnFocusOnClose && marker) marker.focus({ preventScroll: true });
    }

    // ---------- Clicks become navigation ----------

    // Close button, BACK TO MAP, and Esc all go back to the map the same way
    function backToMap() {
      returnFocusOnClose = true;
      navigate('#map');
      returnFocusOnClose = false;
    }

    function stepPlace(direction) {
      if (!panelOpen) return;
      const index = locations.findIndex((l) => l.id === currentId);
      const next = (index + direction + locations.length) % locations.length;
      navigate(placeHash(locations[next].id));
    }

    markerLayer.addEventListener('click', (e) => {
      const btn = e.target.closest('.marker');
      if (btn) navigate(placeHash(btn.dataset.id));
    });

    cardLayer.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) navigate(placeHash(card.dataset.id));
    });

    // Tapping empty map closes the card
    viewport.addEventListener('click', (e) => {
      if (panelOpen && !e.target.closest('.marker, .card')) navigate('#map');
    });

    closeButton.addEventListener('click', backToMap);
    backButton.addEventListener('click', backToMap);
    prevButton.addEventListener('click', () => stepPlace(-1));
    nextButton.addEventListener('click', () => stepPlace(1));

    document.addEventListener('keydown', (e) => {
      // Not while the gallery is on top: the gallery handles its own keys
      if (e.key === 'Escape' && panelOpen && galleryScene.hidden) backToMap();
    });

    // VIEW MEMORIES: opens the gallery when the place has one
    viewButton.addEventListener('click', () => {
      const loc = locations.find((l) => l.id === currentId);

      console.log('[View memories]', {
        currentId,
        locId: loc && loc.id,
        galleries: Object.keys(GALLERIES),
        hasGallery: loc ? hasGallery(loc.id) : null,
        hashBefore: location.hash
      });

      if (!loc) return;

      if (hasGallery(loc.id)) {
        navigate('#gallery/' + loc.id);
        console.log('[View memories] hashAfter:', location.hash);
        return;
      }

      // Places without a gallery yet
      document.dispatchEvent(new CustomEvent('memories:open', { detail: { id: loc.id } }));

      panelNote.textContent = 'The memories for this place are on their way.';
      window.clearTimeout(noteTimer);
      noteTimer = window.setTimeout(() => { panelNote.textContent = ''; }, 3500);
    });

    // ---------- Setup ----------

    window.addEventListener('resize', () => {
      if (!started || mapScene.hidden) return;
      stopGlide();
      measure();
      setView(view);
    });

    buildRegions();
    buildLocations();
    buildTrees();
    buildLights();

    return {
      // Called whenever the map is freshly shown (first time, or after leaving and coming back)
      show(options) {
        measure();

        if (!started) {
          started = true;
          startView(!options || options.settle !== false);
        } else {
          setView(view);                 // keep wherever the user had panned/zoomed to
        }
      },
      select,
      closePanel
    };
  })();

  // ==========================================================
  // 5. THE GALLERY (photo grid, photograph viewer, videos)
  // ==========================================================

  const galleryModule = (() => {
    const root = galleryScene;

    const backButton = document.getElementById('gallery-back');
    const eyebrowEl = document.getElementById('gallery-eyebrow');
    const titleEl = document.getElementById('gallery-title');
    const subtitleEl = document.getElementById('gallery-subtitle');
    const countEl = document.getElementById('gallery-count');
    const statusEl = document.getElementById('gallery-status');
    const gridEl = document.getElementById('gallery-grid');

    const motionEl = document.getElementById('gallery-motion');
    const motionTitleEl = document.getElementById('gallery-motion-title');
    const videoNote = document.getElementById('gallery-video-note');

    // The videos live in their own container. If the page still has the older
    // single-video markup, swap it for the container so index.html needs no edit.
    let videosEl = document.getElementById('gallery-videos');
    if (!videosEl) {
      const oldFrame = document.getElementById('gallery-video-frame');
      if (oldFrame) oldFrame.remove();

      videosEl = document.createElement('div');
      videosEl.id = 'gallery-videos';
      motionEl.insertBefore(videosEl, videoNote);
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxStage = document.getElementById('lightbox-stage');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCount = document.getElementById('lightbox-count');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    const cache = {};          // gallery id → promise of what was found
    let activeId = null;       // gallery currently on screen
    let data = null;           // what was found for it: { photos, videos, ... }
    let loadToken = 0;
    let wanted = 0;            // photograph number the URL asks for (0 = none)
    let lightboxOpen = false;
    let lightboxIndex = 0;
    let lastThumb = null;      // thumbnail to return focus to
    let pushed = false;        // did opening the viewer add a history entry?
    let closing = false;

    // ---------- Finding the files (only files that really exist are used) ----------

    function probeByElement(url, kind) {
      return new Promise((resolve) => {
        const el = kind === 'video' ? document.createElement('video') : new Image();
        const done = (ok) => {
          el.onload = null;
          el.onerror = null;
          el.onloadedmetadata = null;
          resolve(ok);
        };

        el.onerror = () => done(false);
        if (kind === 'video') {
          el.preload = 'metadata';
          el.onloadedmetadata = () => done(true);
        } else {
          el.onload = () => done(true);
        }
        el.src = url;
      });
    }

    // Asks the server whether a file exists without downloading it
    function fileExists(url, kind) {
      return fetch(url, { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          if (res.status === 405 || res.status === 501) return probeByElement(url, kind);
          if (!res.ok) return false;
          const type = res.headers.get('content-type') || '';
          return type.indexOf('text/html') !== 0;       // a "not found" web page is not a photograph
        })
        .catch(() => probeByElement(url, kind));
    }

    // Finds numbered files: <prefix><two digits>.<ext>, in groups of 8,
    // stopping after a group in which nothing was found.
    async function findFiles(spec, kind) {
      const nameOf = (n) => spec.prefix + String(n).padStart(2, '0') + '.' + spec.ext;
      const tried = [];
      const items = [];
      let dir = null;

      // 1. Which folder holds them? (Look for any of the first three numbers.)
      for (const candidate of spec.dirs) {
        const urls = [1, 2, 3].map((n) => candidate + nameOf(n));
        tried.push(...urls);
        const flags = await Promise.all(urls.map((url) => fileExists(url, kind)));
        if (flags.some(Boolean)) {
          dir = candidate;
          break;
        }
      }

      // 2. Which numbers exist in it?
      if (dir !== null) {
        const GROUP = 8;
        const max = Math.min(spec.max || 99, 99);

        for (let start = 1; start <= max; start += GROUP) {
          const numbers = [];
          for (let n = start; n < start + GROUP && n <= max; n++) numbers.push(n);

          const flags = await Promise.all(numbers.map((n) => fileExists(dir + nameOf(n), kind)));
          let anyFound = false;

          numbers.forEach((n, i) => {
            if (flags[i]) {
              items.push({ number: n, src: dir + nameOf(n) });
              anyFound = true;
            }
          });

          if (!anyFound) break;
        }
      }

      // 3. Hand-registered files with other names (checked too)
      for (const path of spec.extra || []) {
        if (await fileExists(path, kind)) items.push({ number: null, src: path });
        else tried.push(path);
      }

      return { items, tried };
    }

    async function resolveGallery(cfg) {
      const photoResult = await findFiles({
        dirs: cfg.photoDirs,
        prefix: cfg.photoPrefix,
        ext: cfg.photoExt,
        max: cfg.photoMax,
        extra: cfg.extraPhotos
      }, 'image');

      const videoResult = cfg.videos
        ? await findFiles(cfg.videos, 'video')
        : { items: [], tried: [] };

      const photos = photoResult.items.map((item) => ({
        number: item.number,
        src: item.src,
        caption: (item.number && cfg.captions && cfg.captions[item.number]) || ''
      }));

      console.info(
        '[' + cfg.title + ' gallery] photos:', photos.map((p) => p.src),
        '| videos:', videoResult.items.map((v) => v.src)
      );

      return {
        photos,
        videos: videoResult.items,
        triedPhotos: photoResult.tried,
        triedVideos: videoResult.tried
      };
    }

    function load(id) {
      if (!cache[id]) cache[id] = resolveGallery(GALLERIES[id]);
      return cache[id];
    }

    // ---------- Drawing the gallery ----------

    function pauseVideos() {
      videosEl.querySelectorAll('video').forEach((v) => v.pause());
    }

    function renderShell(id, cfg) {
      const place = locations.find((l) => l.id === id);

      pauseVideos();
      eyebrowEl.textContent = place && place.category === 'campus' ? 'Inside campus' : 'Beyond the campus';
      titleEl.textContent = cfg.title;
      subtitleEl.textContent = cfg.subtitle;
      countEl.textContent = '';
      statusEl.textContent = 'Gathering the photographs\u2026';
      gridEl.innerHTML = '';
      videosEl.innerHTML = '';
      videoNote.textContent = '';
      motionEl.hidden = true;
      root.scrollTop = 0;
    }

    function renderCount() {
      const parts = [];
      const p = data.photos.length;
      const v = data.videos.length;

      if (p) parts.push(p + (p === 1 ? ' photograph' : ' photographs'));
      if (v) parts.push(v + (v === 1 ? ' video' : ' videos'));

      countEl.textContent = parts.join(' \u00B7 ');
    }

    function renderGrid(cfg) {
      const photos = data.photos;
      gridEl.innerHTML = '';

      if (!photos.length) {
        statusEl.textContent = 'No photographs were found yet. Looked for ' +
          cfg.photoPrefix + '01.' + cfg.photoExt + ' in ' + cfg.photoDirs[0] + '.';
        console.warn('No photographs found for ' + cfg.title + '. Tried:', data.triedPhotos);
        return;
      }

      statusEl.textContent = '';

      photos.forEach((item, i) => {
        const li = document.createElement('li');
        li.style.setProperty('--i', i);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery__item';
        button.dataset.index = String(i + 1);

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = cfg.title + ', photograph ' + (i + 1) + (item.caption ? ': ' + item.caption : '');
        img.addEventListener('error', () => li.remove());
        img.src = item.src;

        button.appendChild(img);
        li.appendChild(button);
        gridEl.appendChild(li);
      });
    }

    function renderVideos(cfg) {
      const spec = cfg.videos;

      videosEl.innerHTML = '';
      videoNote.textContent = '';

      if (!spec) {
        motionEl.hidden = true;
        return;
      }

      motionEl.hidden = false;
      motionTitleEl.textContent = spec.title;

      const list = data.videos;

      if (!list.length) {
        // No broken player: explain instead
        videoNote.textContent = 'No videos were found yet. Looked for ' +
          spec.prefix + '01.' + spec.ext + ' in ' + spec.dirs[0] + '.';
        console.warn('No videos found for ' + cfg.title + '. Tried:', data.triedVideos);
        return;
      }

      list.forEach((item, i) => {
        const frame = document.createElement('figure');
        frame.className = 'gallery__video-frame';

        const el = document.createElement('video');
        el.className = 'gallery__video';
        el.controls = true;               // play, pause and seek come from the native player
        el.playsInline = true;
        el.preload = 'metadata';          // only the first bytes are fetched until it is played
        el.setAttribute('aria-label', cfg.title + ' video ' + (i + 1) + ' of ' + list.length);

        // A phone-shaped video should not stretch across a wide screen
        el.addEventListener('loadedmetadata', () => {
          frame.classList.toggle('is-portrait', el.videoHeight > el.videoWidth);
        });

        el.addEventListener('error', () => {
          frame.remove();
          videoNote.textContent = 'One of the videos couldn\u2019t be played on this device.';
        });

        el.src = item.src;
        frame.appendChild(el);

        if (list.length > 1) {
          const label = document.createElement('figcaption');
          label.className = 'gallery__video-count';
          label.textContent = (i + 1) + ' / ' + list.length;
          frame.appendChild(label);
        }

        videosEl.appendChild(frame);
      });
    }

    // ---------- The photograph viewer ----------

    function preload(index) {
      const item = data && data.photos[index - 1];
      if (item) new Image().src = item.src;
    }

    function openLightbox(index) {
      const cfg = GALLERIES[activeId];
      const total = data.photos.length;
      const item = data.photos[index - 1];
      const wasOpen = lightboxOpen;

      lightboxOpen = true;
      closing = false;
      lightboxIndex = index;

      lightboxCount.textContent = index + ' / ' + total;
      lightboxCaption.textContent = item.caption;
      lightboxCaption.hidden = !item.caption;
      lightboxPrev.hidden = total < 2;
      lightboxNext.hidden = total < 2;

      lightboxImg.classList.add('is-changing');
      lightboxImg.alt = cfg.title + ', photograph ' + index + ' of ' + total +
        (item.caption ? ': ' + item.caption : '');
      lightboxImg.src = item.src;

      if (!wasOpen) {
        lightbox.inert = false;
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('is-open');

        // The page behind must neither scroll nor take focus
        root.classList.add('is-viewing');
        root.inert = true;

        lightboxClose.focus({ preventScroll: true });
      }

      preload(index + 1);
      preload(index - 1);
    }

    function closeLightbox(restoreFocus) {
      closing = false;
      if (!lightboxOpen) return;

      lightboxOpen = false;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.inert = true;

      root.classList.remove('is-viewing');
      root.inert = false;

      if (restoreFocus && lastThumb && document.contains(lastThumb)) {
        lastThumb.focus({ preventScroll: true });
      }
    }

    // Make the viewer match what the URL asks for
    function syncLightbox() {
      const total = data ? data.photos.length : 0;

      if (wanted >= 1 && wanted <= total) {
        openLightbox(wanted);
        return;
      }

      closeLightbox(true);
      pushed = false;

      // The URL named a photograph that does not exist: fall back to the gallery itself
      if (wanted !== 0 && data) navigate('#gallery/' + activeId, { replace: true });
    }

    // The visitor wants to close the viewer: go back to the gallery
    function requestClose() {
      if (!lightboxOpen || closing) return;
      closing = true;

      if (pushed) {
        pushed = false;
        history.back();                  // returns to the gallery entry we came from
      } else {
        navigate('#gallery/' + activeId, { replace: true });
      }
    }

    // Next / previous replace the current history entry, so Back still closes the viewer
    function step(direction) {
      if (!lightboxOpen || !data) return;
      const total = data.photos.length;
      if (total < 2) return;

      const next = ((lightboxIndex - 1 + direction + total) % total) + 1;
      navigate('#gallery/' + activeId + '/' + next, { replace: true });
    }

    // ---------- Called by the router ----------

    function show(id, photoNumber) {
      const cfg = GALLERIES[id];
      if (!cfg) return;

      wanted = photoNumber || 0;

      if (activeId !== id) {
        activeId = id;
        data = null;
        renderShell(id, cfg);
      }

      if (data) {
        syncLightbox();
        return;
      }

      const token = ++loadToken;
      load(id).then((result) => {
        if (token !== loadToken || activeId !== id) return;
        data = result;
        renderGrid(cfg);
        renderVideos(cfg);
        renderCount();
        syncLightbox();
      });
    }

    function hide() {
      wanted = 0;
      pushed = false;
      closeLightbox(false);
      pauseVideos();
    }

    // ---------- Events (added once) ----------

    backButton.addEventListener('click', () => navigate('#map'));

    gridEl.addEventListener('click', (e) => {
      const button = e.target.closest('.gallery__item');
      if (!button || !activeId) return;

      lastThumb = button;
      pushed = true;                      // this adds a history entry, so closing can go back
      navigate('#gallery/' + activeId + '/' + button.dataset.index);
    });

    lightboxClose.addEventListener('click', requestClose);
    lightboxPrev.addEventListener('click', () => step(-1));
    lightboxNext.addEventListener('click', () => step(1));

    // Tapping the empty dark area around the photograph closes it
    lightboxStage.addEventListener('click', (e) => {
      if (e.target === lightboxStage) requestClose();
    });

    lightboxImg.addEventListener('load', () => lightboxImg.classList.remove('is-changing'));
    lightboxImg.addEventListener('error', () => {
      lightboxImg.classList.remove('is-changing');
      lightboxCaption.hidden = false;
      lightboxCaption.textContent = 'This photograph couldn\u2019t be loaded.';
    });

    // Swipe left / right to move between photographs
    let swipeX = null;
    let swipeY = null;

    lightboxStage.addEventListener('pointerdown', (e) => {
      swipeX = e.clientX;
      swipeY = e.clientY;
    });

    lightboxStage.addEventListener('pointerup', (e) => {
      if (swipeX === null) return;
      const dx = e.clientX - swipeX;
      const dy = e.clientY - swipeY;
      swipeX = null;

      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    });

    lightboxStage.addEventListener('pointercancel', () => { swipeX = null; });

    document.addEventListener('keydown', (e) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      }
    });

    return { show, hide };
  })();

  // ==========================================================
  // 5b. GUESS THE MEMORY GAME
  // ==========================================================

  const gameModule = (() => {
    const questions = [
      { question: 'Where are we in this picture?', options: ['Library', 'Classroom', 'Vidhya Tuition'], correct: 0 },
      { question: 'We reached Poovam bus stop during this journey. Where did we start from?', options: ['Kumbakonam Bus Stand', 'Trichy', 'Karaikal'], correct: 2 },
      { question: 'Where were we when this photo was taken?', options: ['Sigma Hall', 'NITT', 'KI-RA Auditorium'], correct: 1 },
      { question: 'Where was this photo taken?', options: ['Admin Block', 'SCB', 'Pentagon'], correct: 0 },
      { question: 'Where was this memory captured?', options: ['Zee Blue', 'Guest House', 'Admin Block'], correct: 0 }
    ];

    const content = document.getElementById('game-content');
    const progress = document.getElementById('game-progress');
    const progressFill = document.getElementById('game-progress-fill');
    const title = document.getElementById('game-title');
    const questionText = document.getElementById('game-question');
    const clueImage = document.getElementById('game-image');
    const imageCaption = document.getElementById('game-image-caption');
    const answers = document.getElementById('game-answers');
    const feedback = document.getElementById('game-feedback');
    const reveal = document.getElementById('game-reveal');
    const fullImage = document.getElementById('game-full-image');
    const revealNote = document.getElementById('game-reveal-note');
    const nextButton = document.getElementById('game-next');
    const ending = document.getElementById('game-ending');

    let current = 0;
    let revealed = false;

    function assetPath(kind, index) {
      return 'assets/photos/game/' + kind + '/memory' + String(index + 1).padStart(2, '0') + '.webp';
    }

    function setImage(img, path, fallbackText) {
      img.onerror = () => {
        img.removeAttribute('src');
        img.alt = fallbackText;
        img.classList.add('memory-game__image-missing');
      };
      img.onload = () => img.classList.remove('memory-game__image-missing');
      img.src = path;
    }

    function renderQuestion() {
      const item = questions[current];
      revealed = false;
      ending.hidden = true;
      content.hidden = false;
      progress.textContent = 'MEMORY ' + (current + 1) + ' OF ' + questions.length;
      progressFill.style.width = ((current + 1) / questions.length * 100) + '%';
      title.textContent = 'Guess the Memory';
      questionText.textContent = item.question;
      imageCaption.textContent = 'A little clue from a day worth remembering.';
      setImage(clueImage, assetPath('clues', current), 'Cropped clue image for memory ' + (current + 1));
      reveal.hidden = true;
      fullImage.removeAttribute('src');
      feedback.textContent = '';
      answers.replaceChildren();
      item.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'memory-game__answer';
        button.textContent = String.fromCharCode(65 + index) + '. ' + option;
        button.addEventListener('click', () => chooseAnswer(index, button));
        answers.appendChild(button);
      });
      nextButton.textContent = current === questions.length - 1 ? 'See the final message →' : 'Next Memory →';
    }

    function chooseAnswer(index, button) {
      if (revealed) return;
      const item = questions[current];
      if (index !== item.correct) {
        feedback.textContent = 'Not quite — have another look and try again. ❤️';
        button.classList.remove('is-wrong');
        void button.offsetWidth;
        button.classList.add('is-wrong');
        return;
      }
      revealed = true;
      feedback.textContent = 'You remembered it! ❤️';
      answers.querySelectorAll('button').forEach((answer) => {
        answer.disabled = true;
        if (answer === button) answer.classList.add('is-correct');
      });
      setImage(fullImage, assetPath('full', current), 'Full memory image ' + (current + 1));
      reveal.hidden = false;
      revealNote.textContent = current === questions.length - 1
        ? 'The last memory — and one more thing to say.'
        : 'There it is — the full memory. ❤️';
      reveal.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }

    function finish() {
      content.hidden = true;
      ending.hidden = false;
      ending.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }

    function reset() {
      current = 0;
      renderQuestion();
      gameScene.scrollTop = 0;
    }

    nextButton.addEventListener('click', () => {
      if (!revealed) return;
      if (current === questions.length - 1) finish();
      else { current += 1; renderQuestion(); gameScene.scrollTop = 0; }
    });

    document.getElementById('game-home').addEventListener('click', () => navigate('#opening'));
    document.getElementById('game-ending-home').addEventListener('click', () => navigate('#opening'));
    document.getElementById('game-play-again').addEventListener('click', reset);

    return {
      show() { reset(); },
      hide() {},
      reset
    };
  })();

  // ==========================================================
  // 6. START: read the URL and show the right view
  // ==========================================================

  initRouter();
})();
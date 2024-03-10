import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * when a link is immediately following an icon or picture and
 the link text contains the URL, link it.
 */
export function wrapSpanLink(element = document) {
  element.querySelectorAll('span.icon + a, picture + a').forEach((a) => {
    if (a.href === a.innerHTML) {
      a.innerHTML = '';
      a.append(a.previousElementSibling);
    }
  });
}

/**
 * Writes a script element with the LD JSON struct to the page
 * @param {HTMLElement} parent
 * @param {Object} json
 */
export function addLdJsonScript(parent, json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(json);
  parent.append(script);
}

/**
 * Decorates paragraphs containing a single link as buttons.
 * @param {Element} element container element
 */
export function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        // let default button be text-only, no decoration
        const linkText = a.textContent;
        const linkTextEl = document.createElement('span');
        linkTextEl.classList.add('link-button-text');
        linkTextEl.append(linkText);
        a.textContent = `${linkText}`;
        a.setAttribute('aria-label', `${linkText}`);
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.textContent = '';
          a.className = 'button text'; // default
          up.classList.add('button-container');
          a.append(linkTextEl);
        }
        if (up.childNodes.length === 2 && (up.tagName === 'P' || up.tagName === 'DIV') && up.querySelector('.icon')) {
          const icon = up.querySelector('.icon');
          a.textContent = '';
          a.className = 'button text'; // default
          up.classList.add('button-container', 'button-icon');
          a.append(icon);
          a.append(linkTextEl);
        }
        if (up.childNodes.length === 1
            && up.tagName === 'STRONG'
            && twoup.childNodes.length === 1
            && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (up.childNodes.length === 1
            && up.tagName === 'EM'
            && twoup.childNodes.length === 1
            && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/** allow for link attributes to be added into link text
 * ex: Link Text{target=blank|rel=noopener}
 * @param main
 */
export function buildLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const match = a.textContent.match(/(.*){([^}]*)}/);
    if (match) {
      // eslint-disable-next-line no-unused-vars
      const [_, linkText, attrs] = match;
      a.textContent = linkText;
      a.title = linkText;
      // match all attributes between curly braces
      attrs.split('|').forEach((attr) => {
        const [key, value] = attr.split('=');
        //  a.setAttribute(key.trim(), value.trim());
        a.setAttribute(key, value);
      });
    }
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

const resizeListeners = new WeakMap();

/**
 * Sets section metadata background-image's optimized size from the provided breakpoints.
 *
 * @param {HTMLElement} section - The section element to which the background image will be applied.
 * @param {string} bgImage - The base URL of the background image.
 * @param {Array<{width: string, media?: string}>} [breakpoints=[
 *  { width: '450' },
 *  { media: '(min-width: 450px)', width: '750' },
 *  { media: '(min-width: 750px)', width: '2000' }
 * ]] - An array of breakpoint objects which contain a `width` value of the requested image, and
 * an optional `media` query string indicating which breakpoint to use that image.
 */
function createOptimizedBackgroundImage(section, bgImage, breakpoints = [
  { width: '750' },
  { media: '(min-width: 600px)', width: '2000' },
]) {
  const updateBackground = () => {
    const url = new URL(bgImage, window.location.href);
    const pathname = encodeURI(url.pathname);

    // Filter all matching breakpoints + pick the one with the highest resolution
    const matchedBreakpoints = breakpoints
      .filter((breakpoint) => !breakpoint.media || window.matchMedia(breakpoint.media).matches);
    let matchedBreakpoint;
    if (matchedBreakpoints.length) {
      matchedBreakpoint = matchedBreakpoints
        .reduce((acc, curr) => (parseInt(curr.width, 10) > parseInt(acc.width, 10) ? curr : acc));
    } else {
      [matchedBreakpoint] = breakpoints;
    }

    const adjustedWidth = matchedBreakpoint.width * window.devicePixelRatio;
    section.style.backgroundImage = `url(${pathname}?width=${adjustedWidth}&format=webply&optimize=medium)`;
    section.style.backgroundSize = 'cover';
  };

  // If a listener already exists for this section, remove it
  if (resizeListeners.has(section)) {
    window.removeEventListener('resize', resizeListeners.get(section));
  }

  // Store this function in the WeakMap for this section, attach + update background
  resizeListeners.set(section, updateBackground);
  window.addEventListener('resize', updateBackground);
  updateBackground();
}

/**
 * Finds all sections in the main element of the document
 * that require additional decoration: adding
 * a background image or an arc effect.
 * @param {Element} main
 */

function decorateStyledSections(main) {
  Array.from(main.querySelectorAll('.section-outer[data-background-image]'))
    .forEach((section) => {
      const bgImage = section.dataset.backgroundImage;
      if (bgImage) {
        createOptimizedBackgroundImage(section, bgImage);
      }
    });
  Array.from(main.querySelectorAll('.section-outer[data-nav-id]'))
    .forEach((section) => {
      const id = section.dataset.navId;
      section.id = id;
    });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  buildLinks(main);
  wrapSpanLink(main);
  decorateStyledSections(main);
}

/**
 * Decorates per the template.
 */
async function loadTemplate(doc, templateName) {
  try {
    const cssLoaded = new Promise((resolve) => {
      loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`).then((resolve)).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`failed to load css module for ${templateName}`, err.target.href);
        resolve();
      });
    });
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const mod = await import(`../templates/${templateName}/${templateName}.js`);
          if (mod.default) {
            await mod.default(doc);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load module for ${templateName}`, error);
        }
        resolve();
      })();
    });

    document.body.classList.add(`${templateName}-template`);

    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load block ${templateName}`, error);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  const templateName = getMetadata('template');
  decorateTemplateAndTheme(templateName);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    if (templateName) {
      await loadTemplate(doc, templateName);
    }
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

function matchUrl(currentPagePath, urlPattern) {
  const regexPattern = urlPattern.replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentPagePath);
}

function writeDataLayerScript(jsonData) {
  const urlPath = window.location.pathname;
  const defaultValues = {};

  jsonData.data.reverse().forEach((json) => {
    // check if the current url path matches the "url" in the json object
    if (matchUrl(urlPath, json.url)) {
      Object.entries(json).forEach(([key, value]) => {
        // if the value is not blank and the key does not exist in defaultValues
        // or if the current URL pattern is less specific than the previous one
        if (value && (!defaultValues[key] || json.url.length < defaultValues.url.length)) {
          defaultValues[key] = value;
        }
      });
    }
  });

  // remove the "url" from output
  delete defaultValues.url;

  const scriptBlock = document.createElement('script');
  scriptBlock.innerHTML = `
    dataLayer = window.dataLayer || [];
    dataLayer.push(${JSON.stringify(defaultValues)});
  `;
  document.head.appendChild(scriptBlock);
}

function fetchDataLayer() {
  fetch('/datalayer.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((json) => {
      writeDataLayerScript(json);
    })
    .catch((error) => {
      console.error('There was a problem with your fetch operation:', error);
    });
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  fetchDataLayer();
  loadDelayed();
}

loadPage();

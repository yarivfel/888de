import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// convert the sitemap links to an accordion
function createMobileMenu(block) {
  const accordionItems = block.querySelectorAll('.section-outer:nth-child(2) .default-content-wrapper > ul');
  for (let i = 0; i < accordionItems.length; i += 1) {
    const accordionItem = accordionItems[i];
    const details = document.createElement('details');
    details.className = 'accordion-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-header';
    summary.innerHTML = accordionItem.querySelector('strong').outerHTML;
    details.append(accordionItem.querySelector('li > ul'));
    details.prepend(summary);
    accordionItem.replaceWith(details);
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  createMobileMenu(footer);
  block.append(footer);

  const [paymentStrip, siteMap, regulation, sbtMain, license] = document.querySelectorAll('div.footer>div>div.section-outer');
  paymentStrip.classList.add('payment-strip');
  siteMap.classList.add('site-map');
  regulation.classList.add('regulation');
  sbtMain.classList.add('sbt-main');
  license.classList.add('license');

  // open all accordions on desktop, close them all on mobile
  function checkWindowSize() {
    const isMobileScreen = window.matchMedia('(max-width: 1024px)').matches;
    if (!isMobileScreen) {
      const details = document.querySelectorAll('footer details');
      details.forEach((detail) => {
        detail.setAttribute('open', '');
      });
    } else {
      const details = document.querySelectorAll('footer details');
      details.forEach((detail) => {
        detail.removeAttribute('open');
      });
    }
  }
  checkWindowSize();
  window.addEventListener('load', checkWindowSize);
  window.addEventListener('resize', checkWindowSize);
}

/* eslint-disable object-curly-newline */
/* eslint-disable function-paren-newline */
import { div, ul, li, a } from '../../scripts/dom-helpers.js';

function scrollToTarget(target) {
  const { offsetTop } = target;
  window.scrollTo({
    top: offsetTop,
    behavior: 'smooth',
  });
}

function highlightNav(doc) {
  const $anchors = doc.querySelectorAll('.anchor');
  window.addEventListener('scroll', () => {
    const scrollAmount = window.scrollY;
    $anchors.forEach(($anchor) => {
      if (scrollAmount >= (($anchor.offsetTop) - 80)) {
        const id = $anchor.getAttribute('id');
        const $navLI = doc.querySelector(`a[href="#${id}"]`).parentElement;
        const $activeLI = doc.querySelector('.anchor-nav .active');
        if ($activeLI) $activeLI.classList.remove('active');
        $navLI.classList.add('active');
      }
    });
  });
}

export default async function decorate(doc) {
  const paragraphs = doc.querySelectorAll('main .default-content-wrapper p');
  const $anchorNav = ul({ class: 'anchor-nav' });

  paragraphs.forEach((p) => {
    const pTxt = p.textContent;
    const isAnchor = pTxt.match(/\[anchor:\s*([^\]]+)\]/g);

    if (isAnchor) {
      // get anchor text
      const anchorTxt = pTxt.replace(/\[anchor:\s*|\]/g, '');
      const anchorID = anchorTxt
        .replace(/ /g, '_')
        .replace(/\./g, '')
        .trim()
        .toLowerCase();
      const $anchor = div({ class: 'anchor', id: anchorID });

      p.replaceWith($anchor);

      // build nav
      const $anchorLink = li(a({ href: `#${anchorID}` }, anchorTxt));
      $anchorNav.appendChild($anchorLink);
      $anchorLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState(null, null, `#${anchorID}`);
        scrollToTarget($anchor);
      });
    } // matches
  }); // each

  const $page = doc.querySelector('main > .section-outer > .section');

  $page.prepend($anchorNav);

  highlightNav(doc);
}

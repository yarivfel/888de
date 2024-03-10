/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */
import { addLdJsonScript } from '../../scripts/scripts.js';

function addFaqJson(block) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...block.querySelectorAll('details')].map((qaItem) => {
      const info = {
        '@type': 'Question',
        name: qaItem.querySelector('summary').textContent.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: qaItem.querySelector('.accordion-item-body').textContent.trim(),
        },
      };
      return info;
    }),
  };
  addLdJsonScript(document.querySelector('head'), data);
}

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  if (block.classList.contains('qa')) {
    addFaqJson(block);
  }
}

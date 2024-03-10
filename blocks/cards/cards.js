import { createOptimizedPicture } from '../../scripts/aem.js';
import { a, removeEmptyTags } from '../../scripts/dom-helpers.js';

const createFigureElements = (ul) => {
  const lis = [...ul.children];
  lis.forEach((li) => {
    const pictureDiv = li.querySelector('.cards-card-image');
    const figure = document.createElement('figure');
    figure.append(pictureDiv);
    li.prepend(figure);
    const caption = document.createElement('figcaption');
    const captionDiv = li.querySelector('.cards-card-body');
    caption.append(captionDiv);
    figure.append(caption);

    const cardLinks = li.querySelectorAll('.cards-card-body a');
    const { length } = cardLinks;
    if (length === 0) return;
    // Last link is the one we want to use at card level
    const tempLink = [...cardLinks].at(-1);
    const newLink = a({ href: tempLink });

    cardLinks[length - 1].remove(); // remove last link
    newLink.innerHTML = li.innerHTML;
    li.textContent = '';
    li.appendChild(newLink);
  });
};

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
  createFigureElements(ul);
  removeEmptyTags(block);
}

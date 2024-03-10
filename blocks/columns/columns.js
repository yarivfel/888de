export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const isClubsSections = block.classList.contains('club-sections');
  if (isClubsSections) {
    const imgs = block.querySelectorAll('img');
    imgs.forEach((img) => {
      img.style.width = `${img.width}px`;
    });
  }
  // setup image columns
  let index = 1;
  [...block.children].forEach((row) => {
    if (isClubsSections) {
      row.id = `club-section-${index}`;
    }
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
    index += 1;
  });
}

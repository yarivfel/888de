export default function decorate(block) {
  const contentWrapper = document.createElement('div');
  contentWrapper.classList.add('hero-content-wrapper');
  const mobileSectionDownArrow = document.createElement('img');
  mobileSectionDownArrow.src = '../icons/herobanner-mob-arrow.png';
  mobileSectionDownArrow.classList.add('hero-mobile-section-down-arrow');
  mobileSectionDownArrow.alt = 'arrow-down';
  const stepsWrapper = document.createElement('div');
  stepsWrapper.classList.add('hero-steps-wrapper');
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    if (cols[0].innerText === 'background') {
      const image = document.createElement('div');
      image.classList.add('hero-banner-image');
      const background = cols[1].querySelector('picture');
      background.classList.add('hero-background');
      background.querySelector('img').setAttribute('loading', 'eager');
      image.append(background);
      const mobBackground = cols[1].querySelector('picture');
      mobBackground.classList.add('mobile-background');
      mobBackground.querySelector('img').setAttribute('loading', 'eager');
      image.append(mobBackground);
      block.append(image);
      block.removeChild(row);
    } else if (cols[0].innerText === 'icon') {
      const dtIcon = cols[1].querySelector('picture');
      dtIcon.classList.add('hero-icon-dt');
      contentWrapper.append(dtIcon);
      const mobIcon = cols[1].querySelector('picture');
      mobIcon.classList.add('hero-icon-mob');
      contentWrapper.append(mobIcon);
      block.removeChild(row);
    } else {
      const anchor = document.createElement('a');
      anchor.className = 'hero-banner-section';
      anchor.href = `#${cols[0].innerText}`;
      const dtImage = cols[1].querySelector('picture');
      anchor.append(dtImage);
      stepsWrapper.append(anchor);
      const mobImage = cols[1].querySelector('picture');
      const anchorMob = document.createElement('a');
      anchorMob.className = 'hero-banner-section-mobile';
      anchorMob.href = `#${cols[0].innerText}`;
      anchorMob.append(mobImage);
      anchorMob.append(mobileSectionDownArrow.cloneNode(true));
      stepsWrapper.append(anchorMob);
      block.removeChild(row);
    }
  });

  contentWrapper.append(stepsWrapper);
  block.append(contentWrapper);

  const heroBannerSections = document.querySelectorAll('.hero-banner-section');
  heroBannerSections.forEach((section) => {
    section.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.closest('a').getAttribute('href');
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    });
  });

  const heroBannerSectionsMobile = document.querySelectorAll('.hero-banner-section-mobile');
  heroBannerSectionsMobile.forEach((section) => {
    section.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.closest('a').getAttribute('href');
      document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    });
  });
}

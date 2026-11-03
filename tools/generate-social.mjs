import sharp from 'sharp';

await sharp('public/images/learning-lab-social.svg').png().toFile('public/images/learning-lab-social.png');
console.log('Rendered original social card: public/images/learning-lab-social.png (1200 × 630).');

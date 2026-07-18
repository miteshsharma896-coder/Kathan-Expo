require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categories = [
  { slug: 'white', name: 'Makrana White', colorBase: '#EDEAE1', colorVein: '#B9AF9C' },
  { slug: 'beige', name: 'Kishangarh Beige', colorBase: '#DCC9A6', colorVein: '#9C7B4B' },
  { slug: 'black', name: 'Indian Black', colorBase: '#2B2926', colorVein: '#B08D57' },
  { slug: 'onyx', name: 'Green Onyx', colorBase: '#3B5C4A', colorVein: '#8FB89A' },
  { slug: 'granite', name: 'Rajasthan Granite', colorBase: '#4A4642', colorVein: '#8A8478' },
  { slug: 'sandstone', name: 'Red Sandstone', colorBase: '#8C3A2B', colorVein: '#C98F72' },
];

const products = [
  { name: 'Makrana Statuario White', category: 'white', origin: 'Makrana, Rajasthan', price: 340, thickness: '18mm / 20mm', finish: 'Polished', description: 'The same white marble quarried for the Taj Mahal — fine, tight grain with soft grey veining, prized for flooring and cladding in high-end residences.' },
  { name: 'Makrana Albeta White', category: 'white', origin: 'Makrana, Rajasthan', price: 260, thickness: '18mm', finish: 'Polished', description: 'A more accessible grade of Makrana white with visible veining, ideal for larger residential projects on a budget.' },
  { name: 'Makrana Dungri White', category: 'white', origin: 'Makrana, Rajasthan', price: 225, thickness: '18mm', finish: 'Polished / Honed', description: 'A cooler, brighter white with tighter veining than Albeta — a common choice for temple flooring and inlay work.' },
  { name: 'Ambaji White Marble', category: 'white', origin: 'Ambaji, near Rajasthan border', price: 195, thickness: '18mm / 20mm', finish: 'Polished', description: 'A budget-friendly white marble sourced just across the Rajasthan–Gujarat belt, widely used for residential flooring.' },
  { name: 'Kishangarh Ivory Beige', category: 'beige', origin: 'Kishangarh, Rajasthan', price: 180, thickness: '18mm', finish: 'Polished / Honed', description: "A warm, consistent beige marble processed at Asia's largest marble market. Popular for large-format flooring where a uniform tone is needed." },
  { name: 'Kishangarh Sangemarmar', category: 'beige', origin: 'Kishangarh, Rajasthan', price: 210, thickness: '18mm / 20mm', finish: 'Polished', description: "Fine-grained beige-white marble with subtle striations — a mid-range staple across Rajasthan's marble trade." },
  { name: 'Bidasar Beige Marble', category: 'beige', origin: 'Bidasar, Rajasthan', price: 165, thickness: '18mm', finish: 'Polished', description: 'A softer, sandy beige tone with faint cream veining — commonly used in villa flooring across Jaipur and Jodhpur.' },
  { name: 'Rajnagar Black Marble', category: 'black', origin: 'Rajnagar, Rajasthan', price: 410, thickness: '20mm', finish: 'Polished', description: 'Deep black stone with fine gold-brass veining, finished to a high gloss. Used for feature walls, reception counters and inlay borders.' },
  { name: 'Kotputli Black Marble', category: 'black', origin: 'Kotputli, Rajasthan', price: 365, thickness: '20mm', finish: 'Polished', description: 'A denser, matte-leaning black marble that holds a sharper edge — often chosen for staircases and skirting.' },
  { name: 'Udaipur Green Onyx', category: 'onyx', origin: 'Udaipur, Rajasthan', price: 520, thickness: '20mm', finish: 'Polished, backlit-ready', description: 'Translucent green onyx cut thin enough for backlighting — a striking choice for bar counters and feature panels.' },
  { name: 'Rajsamand Honey Onyx', category: 'onyx', origin: 'Rajsamand, Rajasthan', price: 485, thickness: '20mm', finish: 'Polished, backlit-ready', description: 'Warm amber-honey onyx with dramatic banding — a signature piece for hospitality lobbies and feature niches.' },
  { name: 'Jalore Granite Grey', category: 'granite', origin: 'Jalore, Rajasthan', price: 150, thickness: '18mm', finish: 'Flamed / Polished', description: 'Hard-wearing grey granite suited to kitchen counters, staircases and high-traffic flooring.' },
  { name: 'Jhansi Red Granite', category: 'granite', origin: 'Jalore belt, Rajasthan', price: 170, thickness: '18mm', finish: 'Polished', description: 'A speckled red-black granite popular for kitchen platforms and monument work.' },
  { name: 'Rajasthan Black Galaxy', category: 'granite', origin: 'Jalore, Rajasthan', price: 395, thickness: '18mm / 20mm', finish: 'Polished', description: 'Black granite flecked with fine gold particles — a premium counter-top stone exported worldwide from this belt.' },
  { name: 'Dholpur Red Sandstone', category: 'sandstone', origin: 'Dholpur, Rajasthan', price: 95, thickness: '25mm', finish: 'Natural / Chiseled', description: "Classic red sandstone used across Rajasthan's forts and havelis — a warm, textured stone for facades and pathways." },
  { name: 'Jodhpur Chocolate Sandstone', category: 'sandstone', origin: 'Jodhpur, Rajasthan', price: 110, thickness: '25mm', finish: 'Natural / Sawn', description: 'A rich brown-toned sandstone with a coarser grain, popular for boundary cladding and courtyard paving.' },
  { name: 'Bansi Pink Sandstone', category: 'sandstone', origin: 'Bharatpur, Rajasthan', price: 88, thickness: '25mm', finish: 'Natural / Chiseled', description: "The soft pink-beige sandstone seen across Jaipur's old city facades, quarried near Bharatpur." },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Category.deleteMany({});
  await Product.deleteMany({});

  await Category.insertMany(categories);
  await Product.insertMany(products);

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

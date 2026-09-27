export type BadgeVariant = 'gold' | 'silver' | 'bronze' | 'platinum';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'service' | 'product';
  category: string;
  sellerName: string;
  sellerBadge: BadgeVariant;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  university: string;
  tags: string[];
}

export interface Person {
  id: string;
  name: string;
  handle: string;
  role: string;
  university: string;
  uniShort: string;
  avatar: string;
  rating: number;
  reviews: number;
  tags: string[];
  socials: { x?: string; instagram?: string; whatsapp?: string; tiktok?: string };
}

const IMG = {
  design: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
  code: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
  video: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
  camera: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
  class: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  study: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
  laptop: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  glasses: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&q=80',
  makeup: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
  sneakers: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  books: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
  music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
  cafe: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80',
  date: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80',
  hair: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80',
  fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  print: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80',
};

// ── Real jobs / services (the kind Nigerian students actually hire for) ──────
const SERVICE_LISTINGS: Listing[] = [
  { id: 'svc-content-creator', title: 'Content Creator for Your Brand', description: 'Scroll stopping reels, TikToks and shorts filmed, edited and scheduled for your business.', price: 25000, type: 'service', category: 'Content Creation', sellerName: 'Amara Studio', sellerBadge: 'gold', rating: 4.9, reviewCount: 121, imageUrl: IMG.camera, university: 'UNILAG', tags: ['content creator', 'reels', 'tiktok', 'video', 'social media'] },
  { id: 'svc-social-media', title: 'Social Media Management', description: 'Daily posting, community replies and monthly growth reports for your page.', price: 40000, type: 'service', category: 'Social Media', sellerName: 'Chisom Growth', sellerBadge: 'platinum', rating: 4.8, reviewCount: 87, imageUrl: IMG.phone, university: 'UI', tags: ['social media manager', 'instagram', 'growth', 'community'] },
  { id: 'svc-video-editing', title: 'Video Editing & Motion Graphics', description: 'Premiere Pro and After Effects edits with clean transitions and captions.', price: 27000, type: 'service', category: 'Video Editing', sellerName: 'Tunde Cuts', sellerBadge: 'bronze', rating: 4.7, reviewCount: 40, imageUrl: IMG.video, university: 'FUTA', tags: ['video editor', 'premiere', 'after effects', 'motion graphics'] },
  { id: 'svc-logo-design', title: 'Premium Logo & Brand Identity', description: 'Unique logo, colour system and social media kit delivered in 48 hours.', price: 24000, type: 'service', category: 'Graphic Design', sellerName: 'Chidera O.', sellerBadge: 'platinum', rating: 4.9, reviewCount: 139, imageUrl: IMG.design, university: 'UNILAG', tags: ['logo', 'graphic design', 'branding', 'designer'] },
  { id: 'svc-web-dev', title: 'Web Development (React & Node)', description: 'Fast, mobile friendly websites and dashboards with free hosting setup.', price: 53000, type: 'service', category: 'Web Development', sellerName: 'Emeka Dev', sellerBadge: 'silver', rating: 4.7, reviewCount: 79, imageUrl: IMG.code, university: 'FUTA', tags: ['web developer', 'react', 'node', 'programmer', 'coding'] },
  { id: 'svc-photography', title: 'Campus Event Photography', description: 'Sharp event coverage, graduation shoots and product photography.', price: 50000, type: 'service', category: 'Photography', sellerName: 'Lens & Light', sellerBadge: 'gold', rating: 4.8, reviewCount: 64, imageUrl: IMG.camera, university: 'LASU', tags: ['photographer', 'photography', 'events', 'shoot'] },
  { id: 'svc-tutoring', title: 'JAMB & WAEC Tutoring (Maths & Physics)', description: 'Weekly sessions with past question drills and score tracking.', price: 15000, type: 'service', category: 'Tutoring', sellerName: 'David O.', sellerBadge: 'gold', rating: 4.8, reviewCount: 52, imageUrl: IMG.class, university: 'UNN', tags: ['tutor', 'jamb', 'waec', 'teacher', 'lessons'] },
  { id: 'svc-copywriting', title: 'Copywriting & CV Makeover', description: 'Sales copy, websites and CVs that actually get callbacks.', price: 18000, type: 'service', category: 'Writing', sellerName: 'Fatimah Writes', sellerBadge: 'bronze', rating: 4.6, reviewCount: 33, imageUrl: IMG.books, university: 'ABU', tags: ['copywriter', 'cv', 'resume', 'writing'] },
  { id: 'svc-makeup', title: 'Makeup & Gele for Events', description: 'Home service glam for weddings, matriculations and shoots.', price: 20000, type: 'service', category: 'Beauty', sellerName: 'Ify Glam', sellerBadge: 'silver', rating: 4.9, reviewCount: 96, imageUrl: IMG.makeup, university: 'OAU', tags: ['makeup artist', 'beauty', 'gele', 'makeover'] },
  { id: 'svc-dj', title: 'DJ & Sound for Small Events', description: 'Sound, lights and mixing for birthdays, unions and end of session parties.', price: 60000, type: 'service', category: 'Music & Audio', sellerName: 'DJ Spin', sellerBadge: 'gold', rating: 4.7, reviewCount: 58, imageUrl: IMG.music, university: 'UNIBEN', tags: ['dj', 'sound', 'music', 'event'] },
  { id: 'svc-data-analysis', title: 'Data Analysis & Excel Dashboards', description: 'SPSS, Excel and Python analysis with clean visual reports for students.', price: 36000, type: 'service', category: 'Data Analysis', sellerName: 'Ngozi Data', sellerBadge: 'silver', rating: 4.8, reviewCount: 45, imageUrl: IMG.laptop, university: 'UI', tags: ['data analysis', 'excel', 'spss', 'python', 'statistics'] },
  { id: 'svc-delivery', title: 'Campus Errand & Delivery Runner', description: 'Food, documents and parcels moved across campus in minutes.', price: 5000, type: 'service', category: 'Delivery', sellerName: 'Kunle Runs', sellerBadge: 'bronze', rating: 4.5, reviewCount: 210, imageUrl: IMG.cafe, university: 'UNILAG', tags: ['delivery', 'errand', 'runner', 'campus'] },
];


// ── Campus lifestyle products (clothing, phones, food, glasses and more) ─────
const PRODUCT_LISTINGS: Listing[] = [
  { id: 'prd-thrift-jacket', title: 'Premium Thrift Denim Jacket', description: 'Clean picked denim, sizes M to XXL, try before you pay on delivery.', price: 12500, type: 'product', category: 'Fashion & Thrift', sellerName: 'Bola Fits', sellerBadge: 'gold', rating: 4.8, reviewCount: 74, imageUrl: IMG.fashion, university: 'LASU', tags: ['clothing', 'thrift', 'okrika', 'fashion', 'jacket', 'wear'] },
  { id: 'prd-sneakers', title: 'Fresh Sneakers (UK Used)', description: 'Gently used sneakers, 100% original, campus delivery same day.', price: 28000, type: 'product', category: 'Fashion & Thrift', sellerName: 'Sneaker Hub', sellerBadge: 'silver', rating: 4.7, reviewCount: 112, imageUrl: IMG.sneakers, university: 'OAU', tags: ['shoes', 'sneakers', 'fashion', 'clothing'] },
  { id: 'prd-eyeglasses', title: 'Prescription Eyeglasses & Frames', description: 'Trendy frames with free eye test and lenses fitted on campus.', price: 18500, type: 'product', category: 'Eyewear', sellerName: 'Clear Sight NG', sellerBadge: 'platinum', rating: 4.9, reviewCount: 66, imageUrl: IMG.glasses, university: 'UI', tags: ['eyeglasses', 'glasses', 'frames', 'lenses', 'eyewear'] },
  { id: 'prd-iphone', title: 'iPhone 13 (128GB) Deal', description: 'Foreign used, spotless, battery health 90%+, with 1 month warranty.', price: 480000, type: 'product', category: 'Phones & Gadgets', sellerName: 'PhoneDoc NG', sellerBadge: 'gold', rating: 4.8, reviewCount: 203, imageUrl: IMG.phone, university: 'UNIBEN', tags: ['phone', 'iphone', 'phones dealer', 'smartphone', 'gadgets'] },
  { id: 'prd-laptop', title: 'HP EliteBook 840 (Core i5)', description: 'Student laptop for assignments and coding, comes with bag and mouse.', price: 320000, type: 'product', category: 'Laptops & Gadgets', sellerName: 'Laptop Base', sellerBadge: 'silver', rating: 4.6, reviewCount: 58, imageUrl: IMG.laptop, university: 'FUTA', tags: ['laptop', 'computer', 'hp', 'gadgets'] },
  { id: 'prd-jollof-catering', title: 'Party Jollof & Small Chops Catering', description: 'Wide range platters for study groups, birthdays and union events.', price: 15000, type: 'product', category: 'Food & Catering', sellerName: 'Mama Z Kitchen', sellerBadge: 'gold', rating: 4.9, reviewCount: 141, imageUrl: IMG.food, university: 'UNILORIN', tags: ['food', 'jollof', 'catering', 'cooking', 'small chops'] },
  { id: 'prd-snacks-box', title: 'Study Night Snack Box', description: 'Indomie, drinks, biscuits and fruits delivered to your hostel.', price: 4500, type: 'product', category: 'Food & Catering', sellerName: 'SnackRush', sellerBadge: 'bronze', rating: 4.6, reviewCount: 89, imageUrl: IMG.cafe, university: 'UNILAG', tags: ['food', 'snacks', 'delivery', 'indomie'] },
  { id: 'prd-books', title: 'Final Year Textbook Bundle', description: 'Complete course texts for 300L and 400L students at student prices.', price: 22000, type: 'product', category: 'Textbooks & Courses', sellerName: 'Scale Books', sellerBadge: 'silver', rating: 4.7, reviewCount: 67, imageUrl: IMG.books, university: 'UNN', tags: ['textbooks', 'books', 'course materials'] },
  { id: 'prd-hair', title: 'Braided Wig & Styling Package', description: 'Human hair wigs and braiding with free installation in hostel.', price: 35000, type: 'product', category: 'Beauty & Hair', sellerName: 'HairBy Zara', sellerBadge: 'gold', rating: 4.8, reviewCount: 98, imageUrl: IMG.hair, university: 'OAU', tags: ['hair', 'wig', 'braids', 'beauty', 'fashion'] },
  { id: 'prd-printing', title: 'Project Printing & Binding', description: 'Colour printing, spiral binding and laminating, ready in 24 hours.', price: 6000, type: 'product', category: 'Printing & Binding', sellerName: 'PrintIt Campus', sellerBadge: 'bronze', rating: 4.7, reviewCount: 176, imageUrl: IMG.print, university: 'ABU', tags: ['printing', 'binding', 'project', 'laminating'] },
  { id: 'prd-match-date', title: 'Campus Match: Dinner Date Package', description: 'Verified student match with a planned dinner date at a top spot in town. Both profiles verified before any introduction.', price: 20000, type: 'product', category: 'Campus Match', sellerName: 'Grind Match', sellerBadge: 'platinum', rating: 4.8, reviewCount: 54, imageUrl: IMG.date, university: 'UI', tags: ['match', 'date', 'dating', 'love', 'campus match', 'introduction', 'babe'] },
  { id: 'prd-fitness', title: 'Fitness Plan & Gym Buddy Sessions', description: 'Personalised workout plan plus twice weekly accountability sessions.', price: 10000, type: 'product', category: 'Health & Fitness', sellerName: 'Fit With Tobi', sellerBadge: 'bronze', rating: 4.6, reviewCount: 31, imageUrl: IMG.fitness, university: 'FUTA', tags: ['fitness', 'gym', 'workout', 'health'] },
];

export const LISTINGS: Listing[] = [...SERVICE_LISTINGS, ...PRODUCT_LISTINGS];

export const SERVICE_CATEGORIES = Array.from(new Set(SERVICE_LISTINGS.map(l => l.category)));
export const PRODUCT_CATEGORIES = Array.from(new Set(PRODUCT_LISTINGS.map(l => l.category)));


// ── People you can connect with (searchable: try "babe in UI") ────────────────
export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Amara Blessing', handle: '@amara.b', role: 'Content Creator & Model', university: 'University of Ibadan', uniShort: 'UI', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80', rating: 4.9, reviews: 121, tags: ['babe', 'model', 'content creator', 'creator', 'influencer'], socials: { x: 'https://x.com/', instagram: 'https://www.instagram.com/', whatsapp: 'https://wa.me/2348000000000' } },
  { id: 'p2', name: 'Chidera Okafor', handle: '@chidera.designs', role: 'Brand Designer', university: 'University of Lagos', uniShort: 'UNILAG', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', rating: 4.9, reviews: 87, tags: ['babe', 'designer', 'graphics', 'design'], socials: { x: 'https://x.com/', instagram: 'https://www.instagram.com/' } },
  { id: 'p3', name: 'Emeka Adeyemi', handle: '@emeka_dev', role: 'Full Stack Developer', university: 'Federal University of Technology Akure', uniShort: 'FUTA', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', rating: 4.8, reviews: 64, tags: ['developer', 'coder', 'programmer', 'tech'], socials: { x: 'https://x.com/', whatsapp: 'https://wa.me/2348000000000' } },
  { id: 'p4', name: 'Fatima Bello', handle: '@fatimah.writes', role: 'Copywriter & SEO', university: 'Ahmadu Bello University', uniShort: 'ABU', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', rating: 4.8, reviews: 51, tags: ['writer', 'copywriter', 'babe', 'seo'], socials: { instagram: 'https://www.instagram.com/', x: 'https://x.com/' } },
  { id: 'p5', name: 'Tunde Kalu', handle: '@tunde_cuts', role: 'Video Editor', university: 'Obafemi Awolowo University', uniShort: 'OAU', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', rating: 4.7, reviews: 40, tags: ['video editor', 'editor', 'creator'], socials: { x: 'https://x.com/' } },
  { id: 'p6', name: 'Ngozi Eze', handle: '@ngozi_data', role: 'Data Analyst', university: 'University of Ibadan', uniShort: 'UI', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80', rating: 4.8, reviews: 45, tags: ['data', 'analyst', 'excel', 'babe'], socials: { x: 'https://x.com/', whatsapp: 'https://wa.me/2348000000000' } },
  { id: 'p7', name: 'Seun Ajayi', handle: '@seun_music', role: 'Producer & DJ', university: 'University of Benin', uniShort: 'UNIBEN', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80', rating: 4.7, reviews: 58, tags: ['music', 'dj', 'producer', 'beats'], socials: { instagram: 'https://www.instagram.com/' } },
  { id: 'p8', name: 'Zainab Yusuf', handle: '@zainab.glam', role: 'Makeup Artist', university: 'Obafemi Awolowo University', uniShort: 'OAU', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', rating: 4.9, reviews: 96, tags: ['makeup', 'beauty', 'babe', 'artist'], socials: { instagram: 'https://www.instagram.com/', whatsapp: 'https://wa.me/2348000000000' } },
];

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t && !['in', 'a', 'an', 'the', 'for', 'at', 'on', 'is', 'and', 'my', 'me', 'some', 'of'].includes(t));
}

/** Search listings and people in one pass. */
export function searchAll(query: string): { listings: Listing[]; people: Person[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { listings: LISTINGS, people: PEOPLE };
  const tokens = tokenize(q);
  const contains = (haystack: string, token: string) => haystack.includes(token);

  const listings = LISTINGS.filter(l => {
    const hay = `${l.title} ${l.description} ${l.category} ${l.sellerName} ${l.university} ${l.tags.join(' ')}`.toLowerCase();
    return tokens.some(t => contains(hay, t));
  });

  const people = PEOPLE.filter(p => {
    const hay = `${p.name} ${p.handle} ${p.role} ${p.university} ${p.uniShort} ${p.tags.join(' ')}`.toLowerCase();
    return tokens.some(t => contains(hay, t));
  });

  return { listings, people };
}

export function getListings(opts: { type?: 'service' | 'product'; category?: string | null; sort?: string; q?: string }): Listing[] {
  let items = opts.q ? searchAll(opts.q).listings : LISTINGS;
  if (opts.type) items = items.filter(l => l.type === opts.type);
  if (opts.category && opts.category !== 'All Categories') items = items.filter(l => l.category === opts.category);
  switch (opts.sort) {
    case 'Price: Low to High': items = [...items].sort((a, b) => a.price - b.price); break;
    case 'Price: High to Low': items = [...items].sort((a, b) => b.price - a.price); break;
    case 'Highest Rated': items = [...items].sort((a, b) => b.rating - a.rating); break;
    case 'Newest': items = [...items].reverse(); break;
    default: break;
  }
  return items;
}

export const naira = (n: number) => `₦${n.toLocaleString()}`;


export interface GrassberryPartner {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  discountPct?: number;
  locationEnabled: boolean;
}

/**
 * Converts a brand name into a stable internal ID.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Helper for creating partner records.
 */
function partner(
  name: string,
  category: string,
  discountPct?: number,
  aliases: string[] = []
): GrassberryPartner {
  return {
    id: slugify(name),
    name,
    aliases,
    category,
    discountPct,
    locationEnabled: true,
  };
}

/**
 * ============================================================
 * GRASSBERRY PHYSICAL / LOCATION-RELEVANT PARTNERS
 * ============================================================
 *
 * These brands are intended to be matched against real
 * businesses discovered through Geoapify.
 *
 * Geoapify:
 *
 *     GPS
 *       ↓
 *   Real POIs
 *       ↓
 *   Brand matching
 *       ↓
 *   Grassberry Partner
 *       ↓
 *   Moment eligibility
 */
export const GRASSBERRY_PARTNERS: GrassberryPartner[] = [

  // ==========================================================
  // COFFEE / CAFES
  // ==========================================================

  partner(
    "Starbucks",
    "coffee",
    12,
    [
      "starbucks",
      "starbucks coffee",
      "tata starbucks",
    ]
  ),

  partner(
    "Third Wave Coffee",
    "coffee",
    undefined,
    [
      "third wave coffee",
      "third wave coffee roasters",
    ]
  ),

  partner(
    "Cafe Coffee Day",
    "coffee",
    12,
    [
      "cafe coffee day",
      "café coffee day",
      "ccd",
    ]
  ),

  partner(
    "Blue Tokai",
    "coffee",
    undefined,
    [
      "blue tokai",
      "blue tokai coffee",
      "blue tokai coffee roasters",
    ]
  ),

  partner(
    "Tim Hortons",
    "coffee",
    7,
    [
      "tim hortons",
      "timhortons",
    ]
  ),

  partner(
    "The Beer Cafe",
    "dining",
    7.85,
    [
      "the beer cafe",
      "beer cafe",
    ]
  ),

  // ==========================================================
  // FOOD / RESTAURANTS
  // ==========================================================

  partner(
    "Domino's",
    "dining",
    16.5,
    [
      "dominos",
      "domino's",
      "domino's pizza",
      "dominos pizza",
    ]
  ),

  partner(
    "KFC",
    "dining",
    9.75,
    [
      "kfc",
      "kentucky fried chicken",
    ]
  ),

  partner(
    "Subway",
    "dining",
    10,
    [
      "subway",
      "subway india",
    ]
  ),

  partner(
    "Pizza Hut",
    "dining",
    8,
    [
      "pizza hut",
      "pizzahut",
    ]
  ),

  partner(
    "Baskin Robbins",
    "dining",
    11.85,
    [
      "baskin robbins",
      "baskin-robbins",
      "baskin & robbins",
    ]
  ),

  partner(
    "Barbeque Nation",
    "dining",
    6.25,
    [
      "barbeque nation",
      "barbecue nation",
    ]
  ),

  partner(
    "Wendy's",
    "dining",
    7.5,
    [
      "wendys",
      "wendy's",
    ]
  ),

  partner(
    "Faasos",
    "dining",
    7.5,
    [
      "faasos",
    ]
  ),

  partner(
    "Bakingo",
    "dining",
    11.85,
    [
      "bakingo",
    ]
  ),

  partner(
    "The Biryani Life",
    "dining",
    11.5,
    [
      "the biryani life",
      "biryani life",
    ]
  ),

  partner(
    "Honest Bowl",
    "dining",
    11,
    [
      "honest bowl",
    ]
  ),

  partner(
    "Thalaiva Biryani",
    "dining",
    11.5,
    [
      "thalaiva biryani",
    ]
  ),

  partner(
    "Thinsane Pizza",
    "dining",
    11,
    [
      "thinsane pizza",
    ]
  ),

  partner(
    "Lunch Box",
    "dining",
    11,
    [
      "lunch box",
      "lunchbox",
    ]
  ),

  partner(
    "Wow China",
    "dining",
    8.85,
    [
      "wow china",
    ]
  ),

  partner(
    "The Good Bowl",
    "dining",
    7.5,
    [
      "the good bowl",
    ]
  ),

  partner(
    "Wendy's",
    "dining",
    7.5,
    [
      "wendy's",
      "wendys",
    ]
  ),

  partner(
    "Oh! Calcutta",
    "dining",
    11.85,
    [
      "oh calcutta",
      "oh! calcutta",
    ]
  ),

  partner(
    "Sweet Bengal",
    "dining",
    11.85,
    [
      "sweet bengal",
    ]
  ),

  partner(
    "Zambar",
    "dining",
    8,
    [
      "zambar",
    ]
  ),

  partner(
    "Bikanervala",
    "dining",
    13,
    [
      "bikanervala",
      "bikanerwala",
    ]
  ),

  partner(
    "Marriott Dining",
    "dining",
    7.5,
    [
      "marriott dining",
      "marriott",
    ]
  ),

  partner(
    "Wow Momo",
    "dining",
    7.85,
    [
      "wow momo",
      "wowmomo",
    ]
  ),

  partner(
    "Mainland China",
    "dining",
    11.85,
    [
      "mainland china",
    ]
  ),

  partner(
    "Ovenstory",
    "dining",
    7.5,
    [
      "ovenstory",
      "oven story",
    ]
  ),

  partner(
    "Firangi Bake",
    "dining",
    11,
    [
      "firangi bake",
    ]
  ),

  partner(
    "Machaan",
    "dining",
    11.85,
    [
      "machaan",
    ]
  ),

  partner(
    "Lite Bite Food",
    "dining",
    8,
    [
      "lite bite food",
      "lite bite foods",
    ]
  ),

  partner(
    "Cafe Delhi Heights",
    "dining",
    9,
    [
      "cafe delhi heights",
      "café delhi heights",
    ]
  ),

  partner(
    "Absolute Barbecues",
    "dining",
    8,
    [
      "absolute barbecues",
      "absolute barbeques",
    ]
  ),

  partner(
    "YouMee",
    "dining",
    8,
    [
      "youmee",
      "you mee",
    ]
  ),

  partner(
    "FreshMenu",
    "dining",
    4.35,
    [
      "freshmenu",
      "fresh menu",
    ]
  ),

  partner(
    "TGI Friday's",
    "dining",
    10.5,
    [
      "tgi friday's",
      "tgi fridays",
      "fridays",
    ]
  ),

  partner(
    "Vaango",
    "dining",
    7.5,
    [
      "vaango",
    ]
  ),

  partner(
    "Polar Bear",
    "dining",
    undefined,
    [
      "polar bear",
    ]
  ),

  partner(
    "Punjab Grill",
    "dining",
    undefined,
    [
      "punjab grill",
    ]
  ),

  partner(
    "Street Foods",
    "dining",
    undefined,
    [
      "street foods",
    ]
  ),

  partner(
    "Taj",
    "hotel-dining",
    undefined,
    [
      "taj",
      "taj hotels",
      "taj hotel",
    ]
  ),

  partner(
    "Wow Chicken",
    "dining",
    undefined,
    [
      "wow chicken",
    ]
  ),

  // ==========================================================
  // FASHION / RETAIL
  // ==========================================================

  partner(
    "Lifestyle",
    "fashion",
    9.5,
    [
      "lifestyle",
      "lifestyle stores",
    ]
  ),

  partner(
    "Max Fashion",
    "fashion",
    10,
    [
      "max fashion",
      "max",
    ]
  ),

  partner(
    "Westside",
    "fashion",
    10.5,
    [
      "westside",
      "westside tata",
    ]
  ),

  partner(
    "Pantaloons",
    "fashion",
    12,
    [
      "pantaloons",
    ]
  ),

  partner(
    "Raymond",
    "fashion",
    9,
    [
      "raymond",
      "the raymond shop",
      "raymond ready to wear",
    ]
  ),

  partner(
    "Marks & Spencer",
    "fashion",
    9,
    [
      "marks and spencer",
      "marks & spencer",
      "m&s",
    ]
  ),

  partner(
    "Reliance Trends",
    "fashion",
    6.02,
    [
      "reliance trends",
      "trends",
    ]
  ),

  partner(
    "Levi's",
    "fashion",
    10,
    [
      "levi's",
      "levis",
      "levi strauss",
    ]
  ),

  partner(
    "Louis Philippe",
    "fashion",
    7,
    [
      "louis philippe",
    ]
  ),

  partner(
    "Mango",
    "fashion",
    4,
    [
      "mango",
      "mango fashion",
    ]
  ),

  partner(
    "Rare Rabbit",
    "fashion",
    8,
    [
      "rare rabbit",
    ]
  ),

  partner(
    "NEXT",
    "fashion",
    4,
    [
      "next",
      "next fashion",
    ]
  ),

  partner(
    "Style Bazaar",
    "fashion",
    3.5,
    [
      "style bazaar",
    ]
  ),

  partner(
    "Nautica",
    "fashion",
    5,
    [
      "nautica",
    ]
  ),

  partner(
    "Libas",
    "fashion",
    4,
    [
      "libas",
    ]
  ),

  partner(
    "Tasva",
    "fashion",
    undefined,
    [
      "tasva",
    ]
  ),

  partner(
    "R&B",
    "fashion",
    9.85,
    [
      "r&b",
      "r and b",
      "rnb",
    ]
  ),

  partner(
    "Bear House",
    "fashion",
    8,
    [
      "bear house",
      "the bear house",
    ]
  ),

  partner(
    "Kalki",
    "fashion",
    13,
    [
      "kalki",
      "kalki fashion",
    ]
  ),

  partner(
    "Columbia",
    "fashion",
    5,
    [
      "columbia",
      "columbia sportswear",
    ]
  ),

  partner(
    "French Accent",
    "fashion",
    8,
    [
      "french accent",
    ]
  ),

  partner(
    "Color Plus",
    "fashion",
    9.85,
    [
      "color plus",
      "colour plus",
    ]
  ),

  partner(
    "Fastrack Bags",
    "fashion",
    7,
    [
      "fastrack bags",
      "fastrack",
    ]
  ),

  partner(
    "Nautica",
    "fashion",
    5,
    [
      "nautica",
    ]
  ),

  partner(
    "Snitch",
    "fashion",
    13.25,
    [
      "snitch",
      "snitch clothing",
    ]
  ),

  partner(
    "Femmella",
    "fashion",
    10.85,
    [
      "femmella",
    ]
  ),

  partner(
    "Blissclub",
    "fashion",
    11,
    [
      "blissclub",
      "bliss club",
    ]
  ),

  partner(
    "Femmella",
    "fashion",
    10.85,
    [
      "femmella",
    ]
  ),

  partner(
    "Haut Sauce",
    "fashion",
    10,
    [
      "haute sauce",
      "haut sauce",
    ]
  ),

  partner(
    "Haute Sauce",
    "fashion",
    10,
    [
      "haute sauce",
    ]
  ),

  partner(
    "Instafab Plus",
    "fashion",
    8,
    [
      "instafab",
      "instafab plus",
    ]
  ),

  // ==========================================================
  // FOOTWEAR
  // ==========================================================

  partner(
    "Bata",
    "footwear",
    7.6,
    [
      "bata",
    ]
  ),

  partner(
    "Woodland",
    "footwear",
    undefined,
    [
      "woodland",
    ]
  ),

  partner(
    "Hush Puppies",
    "footwear",
    7,
    [
      "hush puppies",
      "hushpuppies",
    ]
  ),

  partner(
    "Relaxo",
    "footwear",
    7.85,
    [
      "relaxo",
    ]
  ),

  partner(
    "Liberty",
    "footwear",
    7.5,
    [
      "liberty",
      "liberty shoes",
    ]
  ),

  partner(
    "Puma",
    "footwear",
    12.6,
    [
      "puma",
      "puma india",
    ]
  ),

  partner(
    "Auricel",
    "footwear",
    20,
    [
      "auricel",
    ]
  ),

  // ==========================================================
  // FITNESS / SPORTS
  // ==========================================================

  partner(
    "Decathlon",
    "fitness",
    5,
    [
      "decathlon",
      "decathlon sports",
      "decathlon sports india",
    ]
  ),

  partner(
    "TEGO",
    "fitness",
    11.85,
    [
      "tego",
    ]
  ),

  partner(
    "Cult.fit",
    "fitness",
    8,
    [
      "cult fit",
      "cult.fit",
      "cultfit",
    ]
  ),

  partner(
    "Speedo",
    "fitness",
    13,
    [
      "speedo",
    ]
  ),

  partner(
    "Adventra Sports",
    "fitness",
    11,
    [
      "adventra sports",
      "adventra",
    ]
  ),

  partner(
    "Shiv Naresh",
    "fitness",
    4.85,
    [
      "shiv naresh",
    ]
  ),

  partner(
    "FitPass",
    "fitness",
    19.85,
    [
      "fitpass",
      "fit pass",
    ]
  ),

  // ==========================================================
  // ELECTRONICS
  // ==========================================================

  partner(
    "Reliance Digital",
    "electronics",
    1,
    [
      "reliance digital",
    ]
  ),

  partner(
    "Croma",
    "electronics",
    2.75,
    [
      "croma",
      "croma electronics",
    ]
  ),

  partner(
    "Apple Premium Reseller",
    "electronics",
    4.25,
    [
      "apple premium reseller",
      "apple authorised reseller",
      "apple authorized reseller",
    ]
  ),

  partner(
    "Imagine Apple",
    "electronics",
    2,
    [
      "imagine apple",
      "imagine",
    ]
  ),

  partner(
    "Sathya",
    "electronics",
    2.85,
    [
      "sathya",
      "sathya agencies",
    ]
  ),

  partner(
    "Vijay Sales",
    "electronics",
    2,
    [
      "vijay sales",
    ]
  ),

  partner(
    "Gupta Distributors",
    "electronics",
    4,
    [
      "gupta distributors",
    ]
  ),

  partner(
    "Future World",
    "electronics",
    3,
    [
      "future world",
    ]
  ),

  partner(
    "Shopy Vision",
    "electronics",
    4.5,
    [
      "shopy vision",
    ]
  ),

  partner(
    "Philips",
    "electronics",
    7,
    [
      "philips",
      "philips india",
    ]
  ),

  partner(
    "Blaupunkt",
    "electronics",
    9.85,
    [
      "blaupunkt",
    ]
  ),

  partner(
    "My Jio Store",
    "electronics",
    1,
    [
      "my jio store",
      "jio store",
    ]
  ),

  partner(
    "BuyWithEMI",
    "electronics",
    2,
    [
      "buywithemI",
      "buy with emi",
      "buywithemI.com",
    ]
  ),

  partner(
    "Hammer",
    "electronics",
    19.85,
    [
      "hammer",
    ]
  ),

  partner(
    "Skullcandy",
    "electronics",
    9.85,
    [
      "skullcandy",
    ]
  ),

  partner(
    "Boat",
    "electronics",
    7,
    [
      "boat",
      "boAt",
    ]
  ),

  // ==========================================================
  // JEWELLERY
  // ==========================================================

  partner(
    "Tanishq",
    "jewellery",
    2.85,
    [
      "tanishq",
    ]
  ),

  partner(
    "Joyalukkas",
    "jewellery",
    3.5,
    [
      "joyalukkas",
      "joy alukkas",
    ]
  ),

  partner(
    "Reliance Jewels",
    "jewellery",
    1.05,
    [
      "reliance jewels",
    ]
  ),

  partner(
    "Kalyan Jewellers",
    "jewellery",
    3.5,
    [
      "kalyan jewellers",
      "kalyan jewelers",
    ]
  ),

  partner(
    "Kalyan Diamond",
    "jewellery",
    7.5,
    [
      "kalyan diamond",
      "kalyan jewellers diamond",
    ]
  ),

  partner(
    "Malabar Gold & Diamonds",
    "jewellery",
    3.85,
    [
      "malabar gold",
      "malabar gold and diamonds",
      "malabar gold & diamonds",
      "malabar diamonds",
    ]
  ),

  partner(
    "PCJ Gold Jewellery",
    "jewellery",
    2.35,
    [
      "pcj gold jewellery",
      "pcj jewellery",
      "pc jeweller",
      "pcj",
    ]
  ),

  partner(
    "PCJ Diamond Jewellery",
    "jewellery",
    2.5,
    [
      "pcj diamond jewellery",
      "pc jeweller",
    ]
  ),

  partner(
    "CaratLane",
    "jewellery",
    2,
    [
      "caratlane",
      "carat lane",
    ]
  ),

  partner(
    "Ornaz",
    "jewellery",
    11.85,
    [
      "ornaz",
    ]
  ),

  partner(
    "Candere",
    "jewellery",
    1.5,
    [
      "candere",
      "candere jewellery",
      "candere gold",
      "candere diamond",
    ]
  ),

  partner(
    "MPJ Jewellery",
    "jewellery",
    2.5,
    [
      "mpj jewellery",
      "mpj jewelry",
    ]
  ),

  partner(
    "GIVA",
    "jewellery",
    12.5,
    [
      "giva",
      "giva jewellery",
    ]
  ),

  partner(
    "PEORA",
    "jewellery",
    13,
    [
      "peora",
    ]
  ),

  // ==========================================================
  // ACCESSORIES / LIFESTYLE
  // ==========================================================

  partner(
    "Lenskart",
    "accessories",
    10,
    [
      "lenskart",
      "lenskart.com",
    ]
  ),

  partner(
    "Samsonite",
    "accessories",
    9.1,
    [
      "samsonite",
    ]
  ),

  partner(
    "Milton",
    "accessories",
    10,
    [
      "milton",
    ]
  ),

  partner(
    "Bagline",
    "accessories",
    14.85,
    [
      "bagline",
    ]
  ),

  partner(
    "Archies",
    "accessories",
    12,
    [
      "archies",
    ]
  ),

  partner(
    "Resonate",
    "accessories",
    10,
    [
      "resonate",
    ]
  ),

  partner(
    "Titan Eye+",
    "accessories",
    8,
    [
      "titan eye",
      "titan eye+",
      "titan eye plus",
    ]
  ),

  partner(
    "Chumbak",
    "accessories",
    12,
    [
      "chumbak",
    ]
  ),

  partner(
    "Cosmus",
    "accessories",
    12.85,
    [
      "cosmus",
    ]
  ),

  partner(
    "Hidesign",
    "accessories",
    12,
    [
      "hidesign",
    ]
  ),

  partner(
    "Prestige",
    "accessories",
    11,
    [
      "prestige",
    ]
  ),

  partner(
    "American Tourister",
    "accessories",
    9.1,
    [
      "american tourister",
    ]
  ),

  partner(
    "IGP",
    "accessories",
    14.85,
    [
      "igp",
      "iGP",
    ]
  ),

  partner(
    "Crossword",
    "accessories",
    7.5,
    [
      "crossword",
    ]
  ),

  partner(
    "Frido",
    "accessories",
    9.85,
    [
      "frido",
    ]
  ),

  partner(
    "Ray-Ban",
    "accessories",
    8,
    [
      "ray ban",
      "ray-ban",
      "rayban",
    ]
  ),

  partner(
    "Flower Aura",
    "accessories",
    14.85,
    [
      "flower aura",
    ]
  ),

  partner(
    "Cello",
    "accessories",
    11.85,
    [
      "cello",
    ]
  ),

  partner(
    "Ferns N Petals",
    "accessories",
    11.85,
    [
      "ferns n petals",
      "ferns and petals",
      "fnp",
    ]
  ),

  partner(
    "William Penn",
    "accessories",
    8,
    [
      "william penn",
    ]
  ),

  partner(
    "Mokobara",
    "accessories",
    8.35,
    [
      "mokobara",
    ]
  ),

  partner(
    "Le Creuset",
    "accessories",
    8,
    [
      "le creuset",
    ]
  ),

  partner(
    "Lawrence & Mayo",
    "accessories",
    8,
    [
      "lawrence and mayo",
      "lawrence & mayo",
    ]
  ),

  partner(
    "Assembly",
    "accessories",
    14.85,
    [
      "assembly",
      "assembly luggage",
    ]
  ),

  partner(
    "Solara",
    "accessories",
    5.5,
    [
      "solara",
    ]
  ),

  partner(
    "Black+Decker",
    "accessories",
    undefined,
    [
      "black and decker",
      "black+decker",
      "black decker",
    ]
  ),

  partner(
    "Pigeon",
    "accessories",
    undefined,
    [
      "pigeon",
      "pigeon india",
    ]
  ),

  partner(
    "Daily Objects",
    "accessories",
    14,
    [
      "daily objects",
    ]
  ),

  // ==========================================================
  // HOME / FURNISHING
  // ==========================================================

  partner(
    "IKEA",
    "home",
    6,
    [
      "ikea",
    ]
  ),

  partner(
    "Home Centre",
    "home",
    7.5,
    [
      "home centre",
      "home center",
    ]
  ),

  partner(
    "Urban Space",
    "home",
    7,
    [
      "urban space",
    ]
  ),

  partner(
    "Pure Home+Living",
    "home",
    10,
    [
      "pure home",
      "pure home and living",
      "pure home+living",
    ]
  ),

  partner(
    "Duroflex",
    "home",
    10,
    [
      "duroflex",
    ]
  ),

  partner(
    "Lulu Hypermarket",
    "grocery",
    2,
    [
      "lulu hypermarket",
      "lulu",
    ]
  ),

  partner(
    "MilkBasket",
    "grocery",
    1,
    [
      "milkbasket",
      "milk basket",
    ]
  ),

  // ==========================================================
  // ENTERTAINMENT
  // ==========================================================

  partner(
    "PVR INOX",
    "entertainment",
    20,
    [
      "pvr inox",
      "pvr",
      "inox",
      "pvr cinemas",
      "inox cinemas",
    ]
  ),

  partner(
    "Cinepolis",
    "entertainment",
    26,
    [
      "cinepolis",
      "cinépolis",
    ]
  ),

  // ==========================================================
  // PHARMACY / HEALTH
  // ==========================================================

  partner(
    "Netmeds",
    "pharmacy",
    9,
    [
      "netmeds",
    ]
  ),

  partner(
    "Apollo Pharmacy",
    "pharmacy",
    11,
    [
      "apollo pharmacy",
      "apollo 24 7",
      "apollo 24/7",
      "apollo",
    ]
  ),

  partner(
    "Veridicus",
    "pharmacy",
    24.85,
    [
      "veridicus",
      "veridicus health care",
    ]
  ),

  partner(
    "Auric",
    "pharmacy",
    24.85,
    [
      "auric",
    ]
  ),

  partner(
    "Mediwheel",
    "pharmacy",
    19.85,
    [
      "mediwheel",
    ]
  ),

  partner(
    "Healthians",
    "health",
    9,
    [
      "healthians",
    ]
  ),

  partner(
    "Apollo Diagnostics",
    "health",
    14,
    [
      "apollo diagnostics",
    ]
  ),

  partner(
    "myUpchar",
    "health",
    5.85,
    [
      "myupchar",
      "myupchar medicine",
    ]
  ),

  partner(
    "NU Ayurved",
    "health",
    12.85,
    [
      "nu ayurved",
      "nuayurveda",
    ]
  ),

  partner(
    "What's Up Wellness",
    "health",
    11,
    [
      "what's up wellness",
      "whats up wellness",
    ]
  ),

  partner(
    "Vitamin Haat",
    "health",
    12.85,
    [
      "vitamin haat",
    ]
  ),

  // ==========================================================
  // GROCERY / ORGANIC
  // ==========================================================

  partner(
    "Organic India",
    "grocery",
    9.85,
    [
      "organic india",
    ]
  ),

  partner(
    "Shiva Organic",
    "grocery",
    20,
    [
      "shiva organic",
    ]
  ),

  // ==========================================================
  // BEAUTY
  // ==========================================================

  partner(
    "Foxtale",
    "beauty",
    16.85,
    [
      "foxtale",
    ]
  ),

  partner(
    "Soulflower",
    "beauty",
    15,
    [
      "soulflower",
    ]
  ),

  partner(
    "Blossoms & Extracts",
    "beauty",
    13,
    [
      "blossoms and extracts",
      "blossoms & extracts",
    ]
  ),

  partner(
    "Typsy Beauty",
    "beauty",
    15,
    [
      "typsy beauty",
    ]
  ),

  partner(
    "Nua Women",
    "beauty",
    23,
    [
      "nua",
      "nua women",
    ]
  ),

  partner(
    "Himalaya",
    "beauty",
    7,
    [
      "himalaya",
      "himalaya wellness",
    ]
  ),

  // ==========================================================
  // KIDS
  // ==========================================================

  partner(
    "Hopscotch",
    "kids",
    3.5,
    [
      "hopscotch",
    ]
  ),

  partner(
    "Chicco",
    "kids",
    12,
    [
      "chicco",
    ]
  ),

  partner(
    "LEGO",
    "kids",
    3,
    [
      "lego",
    ]
  ),

  partner(
    "Me n Moms",
    "kids",
    9,
    [
      "me n moms",
      "me n mom",
      "menmoms",
    ]
  ),

  // ==========================================================
  // TRAVEL / HOTELS / TRANSPORT
  // ==========================================================

  partner(
    "CGH Earth",
    "hotel",
    11,
    [
      "cgh earth",
    ]
  ),

  partner(
    "Goibibo Hotels",
    "hotel",
    14,
    [
      "goibibo hotels",
      "goibibo hotel",
    ]
  ),

  partner(
    "Ixigo Hotels",
    "hotel",
    13,
    [
      "ixigo hotels",
      "ixigo",
    ]
  ),

  partner(
    "Lohono Stays",
    "hotel",
    9,
    [
      "lohono stays",
      "lohono",
    ]
  ),

  partner(
    "Cordelia",
    "travel",
    9,
    [
      "cordelia",
      "cordelia cruises",
    ]
  ),

  partner(
    "Klook",
    "travel",
    6,
    [
      "klook",
    ]
  ),

  partner(
    "Redbus",
    "travel",
    3,
    [
      "redbus",
      "red bus",
    ]
  ),

  partner(
    "Shell Fuel",
    "fuel",
    2,
    [
      "shell",
      "shell fuel",
      "shell petrol pump",
    ]
  ),

  // ==========================================================
  // BEAUTY / JEWELLERY / SPECIALTY STORES
  // ==========================================================

  partner(
    "Just Lil Things",
    "jewellery",
    13.85,
    [
      "just lil things",
      "just little things",
    ]
  ),

  partner(
    "Neeman's",
    "footwear",
    6,
    [
      "neeman's",
      "neemans",
    ]
  ),

  partner(
    "HealthKart",
    "health",
    5,
    [
      "healthkart",
      "health kart",
    ]
  ),

  partner(
    "Fastrack",
    "accessories",
    7,
    [
      "fastrack",
    ]
  ),

  partner(
    "Ray-Ban",
    "accessories",
    8,
    [
      "ray-ban",
      "ray ban",
      "rayban",
    ]
  ),

  // ==========================================================
  // BOOKS / RETAIL / GENERAL
  // ==========================================================

  partner(
    "Crossword",
    "retail",
    7.5,
    [
      "crossword",
    ]
  ),

  partner(
    "Hamleys",
    "kids",
    13,
    [
      "hamleys",
      "hamley's",
    ]
  ),

  partner(
    "Marks & Spencer",
    "fashion",
    9,
    [
      "marks & spencer",
      "marks and spencer",
      "m&s",
    ]
  ),

  // ==========================================================
  // AUTOMOTIVE / SERVICE
  // ==========================================================

  partner(
    "BPCL",
    "fuel",
    undefined,
    [
      "bpcl",
      "bharat petroleum",
      "bharat petroleum corporation",
    ]
  ),

  // ==========================================================
  // SPECIALTY / LUXURY
  // ==========================================================

  partner(
    "Miraggio",
    "fashion",
    12,
    [
      "miraggio",
    ]
  ),

  partner(
    "Mango",
    "fashion",
    4,
    [
      "mango",
    ]
  ),

  partner(
    "Mokobara",
    "travel-accessories",
    8.35,
    [
      "mokobara",
    ]
  ),

  partner(
    "Assembly",
    "travel-accessories",
    14.85,
    [
      "assembly",
      "assembly luggage",
    ]
  ),

  partner(
    "Frido",
    "wellness",
    9.85,
    [
      "frido",
    ]
  ),

  partner(
    "HealthKart",
    "health",
    5,
    [
      "healthkart",
    ]
  ),
];

/**
 * Convenience map.
 */
export const GRASSBERRY_PARTNER_MAP: Record<
  string,
  GrassberryPartner
> = Object.fromEntries(
  GRASSBERRY_PARTNERS.map((partner) => [
    partner.id,
    partner,
  ])
);

/**
 * Only partners that make sense for GPS/POI matching.
 */
export const LOCATION_ENABLED_PARTNERS =
  GRASSBERRY_PARTNERS.filter(
    (partner) => partner.locationEnabled
  );
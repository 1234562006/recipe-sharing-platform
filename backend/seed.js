const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const fs = require('fs');
const envCandidate = fs.existsSync(path.join(__dirname, '../.env'))
  ? path.join(__dirname, '../.env')
  : path.join(__dirname, '../config.env');
dotenv.config({ path: envCandidate });

const connectDB = require('./config/db');
const User = require('./models/User');
const Recipe = require('./models/Recipe');
const Favorite = require('./models/Favorite');

const sampleRecipes = [
  {
    title: 'Avocado Toast with Poached Egg & Chili Flakes',
    description:
      'Artisanal sourdough toasted to golden perfection, crowned with creamy crushed Haas avocado, perfectly poached farm eggs, microgreens, and a dusting of Aleppo chili flakes.',
    ingredients: [
      '2 thick slices sourdough bread',
      '1 ripe Haas avocado',
      '2 large organic free-range eggs',
      '1 tbsp white vinegar (for poaching)',
      '1 tbsp extra virgin olive oil',
      '1/2 lemon, juiced',
      '1/4 tsp crushed red chili flakes',
      'Flaky sea salt and freshly cracked black pepper',
      '1 tbsp fresh microgreens or cilantro for garnish',
    ],
    instructions: [
      'Toast sourdough slices in a skillet or toaster until deeply golden and crisp.',
      'Cut the avocado in half, scoop the flesh into a bowl, and lightly mash with lemon juice, salt, and pepper.',
      'Bring a pot of water to a gentle simmer, stir in white vinegar, and create a gentle vortex.',
      'Crack eggs one at a time into the swirling water and poach for 3 minutes until whites are set and yolks remain runny.',
      'Generously spread crushed avocado across the warm toasted sourdough.',
      'Top each slice with a poached egg, drizzle extra virgin olive oil, and garnish with chili flakes, flaky salt, and fresh microgreens.',
    ],
    category: 'Breakfast',
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian', 'High-Protein', 'Quick'],
  },
  {
    title: 'Fluffy Blueberry Buttermilk Pancakes',
    description:
      'Golden, cloud-like pancakes bursting with fresh blueberries, served warm with creamy grass-fed butter and 100% pure Canadian maple syrup.',
    ingredients: [
      '2 cups all-purpose flour',
      '2 tbsp granulated sugar',
      '2 tsp baking powder',
      '1/2 tsp baking soda',
      '1/2 tsp kosher salt',
      '1 3/4 cups fresh buttermilk',
      '2 large eggs, lightly beaten',
      '1/4 cup unsalted butter, melted and cooled',
      '1 tsp pure vanilla extract',
      '1 1/2 cups fresh organic blueberries',
      'Pure maple syrup and extra butter for serving',
    ],
    instructions: [
      'In a large mixing bowl, whisk together flour, sugar, baking powder, baking soda, and salt.',
      'In a separate bowl, whisk together buttermilk, beaten eggs, melted butter, and vanilla extract.',
      'Pour the wet ingredients into the dry ingredients and fold gently with a spatula until just combined. Do not overmix; small lumps are fine.',
      'Heat a non-stick griddle or skillet over medium heat and lightly butter the surface.',
      'Pour 1/3 cup of batter per pancake onto the hot griddle and immediately scatter fresh blueberries on top.',
      'Cook for 2 to 3 minutes until bubbles burst on the surface, flip carefully, and cook for another 1-2 minutes until golden.',
      'Stack warm pancakes high, top with a pat of butter, and drizzle with pure maple syrup.',
    ],
    category: 'Breakfast',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian'],
  },
  {
    title: 'Mediterranean Quinoa Salad with Lemon-Herb Vinaigrette',
    description:
      'A vibrant, refreshing grain bowl packed with crisp English cucumbers, kalamata olives, heirloom cherry tomatoes, tangy feta, and a zesty lemon-dill dressing.',
    ingredients: [
      '1 cup uncooked tricolor quinoa (rinsed)',
      '2 cups vegetable broth or water',
      '1 cup English cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 cup kalamata olives, pitted and sliced',
      '1/3 cup red onion, finely diced',
      '1/2 cup crumbled Greek feta cheese',
      '1/4 cup fresh Italian flat-leaf parsley, chopped',
      '3 tbsp extra virgin olive oil',
      '2 tbsp fresh lemon juice',
      '1 clove garlic, minced',
      '1/2 tsp dried oregano',
      'Salt and freshly ground black pepper to taste',
    ],
    instructions: [
      'Combine rinsed quinoa and vegetable broth in a saucepan. Bring to a boil, reduce heat to low, cover, and simmer for 15 minutes until liquid is absorbed.',
      'Remove from heat, fluff with a fork, and let cool to room temperature.',
      'In a small mason jar or bowl, whisk olive oil, lemon juice, minced garlic, dried oregano, salt, and black pepper until emulsified.',
      'In a large serving bowl, combine the cooled quinoa, cucumber, cherry tomatoes, kalamata olives, diced red onion, and fresh parsley.',
      'Pour the lemon-herb vinaigrette over the salad and toss well to combine.',
      'Gently fold in crumbled feta cheese and chill for 20 minutes before serving.',
    ],
    category: 'Lunch',
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
  },
  {
    title: 'Gourmet Artisanal Smash Burger with Caramelized Onions',
    description:
      'Crispy-edged, juicy smashed beef patties layered with melted aged cheddar, sweet caramelized balsamic onions, tangy house burger sauce, on a toasted brioche bun.',
    ingredients: [
      '1 lb ground beef (80/20 chuck blend)',
      '4 soft brioche burger buns',
      '4 slices sharp aged cheddar cheese',
      '2 large yellow onions, thinly sliced',
      '2 tbsp unsalted butter',
      '1 tbsp balsamic glaze',
      '1/4 cup mayonnaise',
      '1 tbsp Dijon mustard',
      '1 tbsp sweet pickle relish',
      'Kosher salt and coarse black pepper',
      'Crisp butterhead lettuce and sliced pickles',
    ],
    instructions: [
      'Caramelize the onions: Melt butter in a skillet over medium-low heat. Add sliced onions and cook slowly for 20 minutes until deeply golden. Stir in balsamic glaze and set aside.',
      'Prepare secret burger sauce: Whisk mayonnaise, Dijon mustard, relish, salt, and pepper in a small bowl.',
      'Divide beef into 4 equal loose balls (do not compress). Heat a heavy cast-iron skillet over high heat until smoking hot.',
      'Place beef balls onto the dry skillet. Press flat immediately using a heavy spatula or burger press with parchment paper until ultra thin with lacey edges.',
      'Season generously with salt and pepper. Sear undisturbed for 2 minutes until deeply crusted, flip, immediately add cheddar slices, and cook 1 more minute.',
      'Butter and toast the brioche buns until golden.',
      'Assemble: Spread sauce on both buns, place burger patty with melted cheese, top with caramelized onions, lettuce, and pickles. Serve hot.',
    ],
    category: 'Lunch',
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    difficulty: 'Medium',
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['High-Protein'],
  },
  {
    title: 'Authentic Creamy Chicken Tikka Masala',
    description:
      'Tender spiced marinated chicken roasted to charred perfection, then simmered in a rich, fragrant tomato-butter cream sauce infused with roasted fenugreek and garam masala.',
    ingredients: [
      '1.5 lbs boneless skinless chicken thighs, cut into bite-sized pieces',
      '1/2 cup plain Greek yogurt',
      '2 tbsp ginger-garlic paste',
      '1 tbsp ground cumin',
      '1 tbsp garam masala',
      '1 tsp Kashmiri red chili powder',
      '2 tbsp ghee or butter',
      '1 large onion, finely chopped',
      '1 can (14 oz) crushed San Marzano tomatoes',
      '3/4 cup heavy whipping cream',
      '1 tbsp crushed dried fenugreek leaves (kasuri methi)',
      'Fresh cilantro and warm garlic naan for serving',
    ],
    instructions: [
      'In a bowl, combine chicken, Greek yogurt, 1 tbsp ginger-garlic paste, cumin, garam masala, chili powder, and 1 tsp salt. Marinate for at least 30 minutes.',
      'Broil chicken pieces on high or grill for 10-12 minutes until charred at the edges. Set aside.',
      'Melt ghee in a large Dutch oven over medium heat. Add chopped onions and sauté until golden brown (approx 8 minutes).',
      'Add remaining ginger-garlic paste and spices, cooking for 1 minute until aromatic.',
      'Pour in crushed tomatoes and simmer gently for 15 minutes until the sauce thickens and oil separates.',
      'Stir in heavy whipping cream and crushed fenugreek leaves. Add roasted chicken pieces and simmer for 5-7 minutes.',
      'Garnish with fresh chopped cilantro and serve with hot buttery garlic naan or basmati rice.',
    ],
    category: 'Dinner',
    prepTime: 30,
    cookTime: 35,
    servings: 4,
    difficulty: 'Medium',
    imageUrl:
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Gluten-Free', 'High-Protein'],
  },
  {
    title: 'Classic Italian Pasta Carbonara',
    description:
      'The quintessential Roman pasta dish crafted with crisp guanciale, fresh egg yolks, aged Pecorino Romano, and a generous crack of black pepper. Rich, silky, and authentic.',
    ingredients: [
      '400g spaghetti or rigatoni',
      '150g guanciale or thick-cut pancetta, diced',
      '4 large egg yolks + 1 whole egg',
      '100g freshly grated Pecorino Romano cheese',
      '2 tsp freshly cracked whole black peppercorns',
      'Sea salt for pasta water',
    ],
    instructions: [
      'Bring a large pot of salted water to a gentle rolling boil. Drop pasta and cook until 1 minute shy of al dente.',
      'In a medium bowl, whisk whole egg, egg yolks, grated Pecorino Romano, and freshly cracked black pepper into a thick paste.',
      'In a cold skillet, add diced guanciale and place over medium heat. Render the fat slowly until guanciale is golden and crispy (about 7-8 minutes). Remove from direct heat.',
      'Reserve 1 cup of starchy pasta cooking water, then transfer pasta directly into the skillet with warm rendered guanciale fat.',
      'Let the pan cool for 30 seconds so eggs do not scramble. Pour the egg and cheese mixture over the pasta, tossing vigorously while streaming in a splash of warm pasta water.',
      'Continue tossing until a glossy, velvety emulsion coats every strand of pasta.',
      'Plate immediately topped with crispy guanciale, extra Pecorino Romano, and more black pepper.',
    ],
    category: 'Dinner',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'Hard',
    imageUrl:
      'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['High-Protein'],
  },
  {
    title: 'Crispy Garlic Parmesan Air-Fryer Potato Wedges',
    description:
      'Ultra-crispy russet potato wedges seasoned with smoked paprika, roasted garlic, tossed in melted herb butter and grated Parmesan cheese. The ultimate snack.',
    ingredients: [
      '3 large Russet potatoes, washed and sliced into wedges',
      '2 tbsp olive oil',
      '1 tsp garlic powder',
      '1 tsp smoked paprika',
      '1/2 tsp dried oregano',
      '1/2 tsp kosher salt',
      '1/4 cup freshly grated Parmesan cheese',
      '2 tbsp fresh parsley, finely chopped',
      'Creamy garlic aioli or ranch for dipping',
    ],
    instructions: [
      'Soak potato wedges in cold water for 20 minutes to remove excess starch. Drain and thoroughly pat dry with paper towels.',
      'In a large bowl, toss dried wedges with olive oil, garlic powder, smoked paprika, oregano, and salt until evenly coated.',
      'Preheat air fryer to 390°F (200°C). Arrange wedges in a single layer in the air fryer basket without overcrowding.',
      'Air fry for 18-20 minutes, shaking the basket halfway through, until edges are blistered, golden, and super crisp.',
      'Transfer hot wedges into a bowl, immediately toss with grated Parmesan and fresh parsley so the cheese melts slightly.',
      'Serve piping hot with creamy garlic aioli on the side.',
    ],
    category: 'Snacks',
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian', 'Gluten-Free', 'Quick'],
  },
  {
    title: 'Decadent Molten Chocolate Lava Cakes',
    description:
      'Rich individual bittersweet chocolate cakes with a luscious, flowing warm molten center. Served dusted with powdered sugar and a scoop of Madagascar vanilla bean gelato.',
    ingredients: [
      '1/2 cup unsalted butter (plus extra for ramekins)',
      '6 oz high-quality bittersweet chocolate (60-70% cacao), chopped',
      '2 large eggs + 2 egg yolks',
      '1/4 cup granulated sugar',
      '1 pinch sea salt',
      '2 tbsp all-purpose flour',
      'Unsweetened cocoa powder for dusting ramekins',
      'Powdered sugar and fresh raspberries for garnish',
      'Vanilla bean ice cream for serving',
    ],
    instructions: [
      'Preheat oven to 425°F (218°C). Butter four 6-ounce ramekins and dust inside thoroughly with cocoa powder, tapping out any excess.',
      'In a heatproof bowl set over a pot of simmering water, melt chopped chocolate and butter together until silky and smooth. Remove and let cool slightly.',
      'In a separate bowl, beat whole eggs, egg yolks, sugar, and salt with a whisk or hand mixer until pale and slightly frothy.',
      'Gently fold the melted chocolate mixture and flour into the eggs until just incorporated.',
      'Divide the batter evenly among the prepared ramekins. Place ramekins on a sturdy baking sheet.',
      'Bake for exactly 12-14 minutes until the tops are set but the center remains soft and slightly jiggly.',
      'Let cool for 1 minute, run a knife around edges, invert onto dessert plates, dust with powdered sugar, and serve immediately with vanilla ice cream.',
    ],
    category: 'Desserts',
    prepTime: 15,
    cookTime: 14,
    servings: 4,
    difficulty: 'Medium',
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian'],
  },
  {
    title: 'Creamy Tuscan Garlic Spinach & White Bean Stew',
    description:
      'A hearty, comforting rustic Italian stew made with tender cannellini beans, sun-dried tomatoes, baby spinach, garlic, and simmered in a velvety vegetable herb broth.',
    ingredients: [
      '2 cans (15 oz each) cannellini beans, rinsed and drained',
      '2 tbsp extra virgin olive oil',
      '1 medium yellow onion, finely diced',
      '4 cloves garlic, thinly sliced',
      '1/3 cup sun-dried tomatoes in oil, drained and chopped',
      '3 cups vegetable broth',
      '1/2 cup coconut milk or light cream',
      '3 cups fresh baby spinach leaves',
      '1 tsp dried thyme',
      '1/2 tsp crushed red pepper flakes',
      'Salt and freshly cracked black pepper to taste',
      'Toasted crusty artisan bread for dipping',
    ],
    instructions: [
      'Heat olive oil in a deep skillet or pot over medium heat. Sauté diced onion for 4 minutes until translucent.',
      'Add sliced garlic, sun-dried tomatoes, thyme, and red pepper flakes. Cook for 1-2 minutes until fragrant.',
      'Add drained cannellini beans and vegetable broth. Bring to a gentle boil, then reduce heat and simmer for 10 minutes.',
      'Use a wooden spoon or potato masher to mash about 1/3 of the beans against the side of the pot to naturally thicken the stew.',
      'Stir in coconut milk or cream and let simmer for 3 minutes.',
      'Fold in fresh baby spinach and cook for 2 minutes until wilted.',
      'Taste and season with salt and freshly cracked pepper. Ladle into warm bowls and serve with crusty artisan bread.',
    ],
    category: 'Vegetarian',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free'],
  },
  {
    title: 'Fresh Sparkling Strawberry Mint Mojito Mocktail',
    description:
      'Crisp, effervescent, and deeply thirst-quenching mocktail crafted with ripe crushed summer strawberries, freshly muddled garden mint, tangy Persian lime juice, and sparkling soda.',
    ingredients: [
      '6 ripe fresh strawberries, hulled and quartered',
      '10 fresh garden mint leaves',
      '1.5 oz freshly squeezed lime juice',
      '1 oz agave nectar or pure cane simple syrup',
      'Crushed ice',
      '6 oz chilled sparkling mineral water or club soda',
      'Lime wheels and fresh mint sprigs for garnish',
    ],
    instructions: [
      'In a tall highball glass, add fresh strawberries, mint leaves, and lime juice.',
      'Gently muddle using a cocktail muddler or the handle of a wooden spoon to release juices and aromatic mint oils without tearing leaves to shreds.',
      'Add agave nectar or simple syrup and stir well.',
      'Fill glass to the brim with crushed ice.',
      'Top with chilled sparkling water and gently stir from bottom to top with a bar spoon to combine.',
      'Garnish with a fresh mint sprig and a lime wheel. Serve with a straw and enjoy immediately.',
    ],
    category: 'Beverages',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: 'Easy',
    imageUrl:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    dietaryTags: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Quick'],
  },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    const force = process.argv.includes('--force');

    // Check existing recipes
    const count = await Recipe.countDocuments();
    if (count > 0 && !force) {
      console.log(
        `\x1b[33m[Seed Info]\x1b[0m Database already contains ${count} recipes. Skipping duplicate insertion.`
      );
      console.log('           To overwrite and reseed, run: npm run seed -- --force');
      process.exit(0);
    }

    if (force) {
      console.log('⚠️  --force detected: Clearing existing recipes, favorites, and demo user...');
      await Recipe.deleteMany({});
      await Favorite.deleteMany({});
      await User.deleteMany({ email: 'chef@recipenest.com' });
    }

    // Create or find demo user
    let demoUser = await User.findOne({ email: 'chef@recipenest.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Chef Isabella Romano',
        email: 'chef@recipenest.com',
        password: 'ChefPass123!',
      });
      console.log('✅ Created Demo User Account:');
      console.log('   Email    : chef@recipenest.com');
      console.log('   Password : ChefPass123!');
    } else {
      console.log('ℹ️  Demo user chef@recipenest.com already exists.');
    }

    // Attach author to all sample recipes
    const recipesToInsert = sampleRecipes.map((recipe) => ({
      ...recipe,
      author: demoUser._id,
    }));

    const inserted = await Recipe.insertMany(recipesToInsert);
    console.log(`\x1b[32m[Seed Success]\x1b[0m Successfully seeded ${inserted.length} gourmet recipes!`);
    console.log('   Categories covered: Breakfast, Lunch, Dinner, Snacks, Desserts, Vegetarian, Beverages');

    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m[Seed Error]\x1b[0m ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleRecipes, seedDatabase };

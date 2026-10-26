const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_recipenest_college_fsd_2026';

let mongoServer;
let app;

let userA = {
  name: 'Chef Alice',
  email: 'alice@recipenest.com',
  password: 'Password123!',
};

let userB = {
  name: 'Chef Bob',
  email: 'bob@recipenest.com',
  password: 'Password456!',
};

let tokenA = '';
let tokenB = '';
let userAId = '';
let userBId = '';
let sampleRecipeId = '';

describe('🍳 RecipeNest Full Stack API Test Suite', () => {
  before(async () => {
    // Start in-memory MongoDB instance for isolated testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);

    // Import app after setting test env
    const serverModule = require('../backend/server');
    app = serverModule.app;
  });

  after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // ----------------------------------------------------
  // 1. Health Endpoint
  // ----------------------------------------------------
  test('GET /api/health should return 200 OK and database status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.database.status, 'connected');
  });

  // ----------------------------------------------------
  // 2. User Registration & Validation
  // ----------------------------------------------------
  test('POST /api/auth/register should fail with missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register should fail with short password (< 6 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Shorty', email: 'short@test.com', password: '123' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/register should successfully register User A and return JWT without password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userA);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.ok(res.body.user);
    assert.equal(res.body.user.email, userA.email);
    assert.equal(res.body.user.password, undefined); // Never return password!

    tokenA = res.body.token;
    userAId = res.body.user._id;
  });

  test('POST /api/auth/register should prevent duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userA);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already in use|already exists/i);
  });

  test('POST /api/auth/register should successfully register User B', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(userB);

    assert.equal(res.status, 201);
    tokenB = res.body.token;
    userBId = res.body.user._id;
  });

  // ----------------------------------------------------
  // 3. User Login & Verification
  // ----------------------------------------------------
  test('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userA.email, password: 'WrongPassword999' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('POST /api/auth/login should authenticate valid user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: userA.email, password: userA.password });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.password, undefined);
  });

  test('GET /api/auth/me should return authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.name, userA.name);
    assert.equal(res.body.user.email, userA.email);
    assert.equal(res.body.user.password, undefined);
  });

  test('GET /api/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // ----------------------------------------------------
  // 4. Recipe Creation & Validation
  // ----------------------------------------------------
  test('POST /api/recipes should reject recipe creation if not authenticated', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .send({ title: 'Unauthorized Recipe', category: 'Breakfast' });

    assert.equal(res.status, 401);
  });

  test('POST /api/recipes should reject recipe with missing required fields', async () => {
    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: '', category: '' });

    assert.equal(res.status, 400);
  });

  test('POST /api/recipes should create and persist recipe in DB for User A', async () => {
    const payload = {
      title: 'Creamy Avocado Sourdough Toast',
      description: 'Artisanal sourdough with ripe avocado, poached eggs and microgreens.',
      ingredients: ['2 sourdough slices', '1 avocado', '2 organic eggs', '1 tbsp olive oil'],
      instructions: ['Toast sourdough.', 'Mash avocado with salt.', 'Poach eggs and assemble.'],
      category: 'Breakfast',
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
      dietaryTags: ['Vegetarian', 'Quick'],
    };

    const res = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.recipe.title, payload.title);
    assert.equal(res.body.recipe.author.name, userA.name);
    assert.equal(res.body.recipe.totalTime, 15);

    sampleRecipeId = res.body.recipe._id;
  });

  // ----------------------------------------------------
  // 5. Recipe Queries, Search & Filtering
  // ----------------------------------------------------
  test('GET /api/recipes should return list of published recipes', async () => {
    const res = await request(app).get('/api/recipes');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.recipes.length >= 1);
  });

  test('GET /api/recipes should filter by category', async () => {
    const res = await request(app).get('/api/recipes?category=Breakfast');
    assert.equal(res.status, 200);
    assert.ok(res.body.recipes.every((r) => r.category.toLowerCase() === 'breakfast'));
  });

  test('GET /api/recipes should filter by search keyword', async () => {
    const res = await request(app).get('/api/recipes?search=Avocado');
    assert.equal(res.status, 200);
    assert.ok(res.body.recipes.length >= 1);
  });

  test('GET /api/recipes should filter by maxTime', async () => {
    const res = await request(app).get('/api/recipes?maxTime=20');
    assert.equal(res.status, 200);
    assert.ok(res.body.recipes.length >= 1);
  });

  test('GET /api/recipes/:id should return single recipe details', async () => {
    const res = await request(app).get(`/api/recipes/${sampleRecipeId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.recipe._id, sampleRecipeId);
  });

  test('GET /api/recipes/:id should return 400 Bad Request for invalid MongoDB ObjectId', async () => {
    const res = await request(app).get('/api/recipes/invalid-mongodb-id-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid recipe id format/i);
  });

  test('GET /api/recipes/:id should return 404 Not Found for non-existent recipe ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/recipes/${nonExistentId}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // ----------------------------------------------------
  // 6. Recipe Ownership Authorization
  // ----------------------------------------------------
  test('PUT /api/recipes/:id should FORBID User B from editing User A recipe (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/recipes/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked by User B' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /not authorized/i);
  });

  test('PUT /api/recipes/:id should ALLOW User A (author) to edit their own recipe', async () => {
    const res = await request(app)
      .put(`/api/recipes/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Artisanal Avocado Sourdough Toast Deluxe' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.recipe.title, 'Artisanal Avocado Sourdough Toast Deluxe');
  });

  test('DELETE /api/recipes/:id should FORBID User B from deleting User A recipe (403 Forbidden)', async () => {
    const res = await request(app)
      .delete(`/api/recipes/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  // ----------------------------------------------------
  // 7. User Recipes Endpoint
  // ----------------------------------------------------
  test('GET /api/users/me/recipes should return recipes authored by the caller', async () => {
    const res = await request(app)
      .get('/api/users/me/recipes')
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 1);
  });

  // ----------------------------------------------------
  // 8. Favorites System & Duplicate Prevention
  // ----------------------------------------------------
  test('POST /api/favorites/:recipeId should allow User B to favorite User A recipe', async () => {
    const res = await request(app)
      .post(`/api/favorites/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
  });

  test('POST /api/favorites/:recipeId should PREVENT duplicate favorite for same user and recipe', async () => {
    const res = await request(app)
      .post(`/api/favorites/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already in your favorites/i);
  });

  test('GET /api/favorites should list favorited recipes for authenticated user', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.favorites[0].recipe._id, sampleRecipeId);
  });

  test('DELETE /api/favorites/:recipeId should remove recipe from favorites', async () => {
    const res = await request(app)
      .delete(`/api/favorites/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenB}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const checkRes = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${tokenB}`);
    assert.equal(checkRes.body.count, 0);
  });

  // ----------------------------------------------------
  // 9. Recipe Deletion by Owner
  // ----------------------------------------------------
  test('DELETE /api/recipes/:id should ALLOW User A (author) to delete their recipe', async () => {
    const res = await request(app)
      .delete(`/api/recipes/${sampleRecipeId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify it is gone
    const verifyRes = await request(app).get(`/api/recipes/${sampleRecipeId}`);
    assert.equal(verifyRes.status, 404);
  });
});

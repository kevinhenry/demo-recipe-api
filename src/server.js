'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;
// set up my cache: it starts empty
const CACHE = {};

app.get('/recipes', getRecipes);

function getRecipes(request, response) {
  const ingredient = request.query.ingredient;
  if(CACHE[ingredient]) {
    console.log('Cache hit, not making request to Edamam');
    // don't make the request to Edamam, just send the response
    let previousResponseData = CACHE[ingredient];
    response.status(200).send(previousResponseData);
  } else {}
  // I haven't seen it before, make the request to Edamam using Superagent
  console.log('Cache miss, making request to Edamam');
  const url = `https://api.edamam.com/search`;
  const query = {
    q:ingredient,
    app_id:process.env.FOOD_APP_ID,
    app_key:process.env.FOOD_APP_KEY
  };

  superagent
    .get(url)
    .query(query)
    .then(res => {
      const recipeArr = res.body.hits.map(recipe => new Recipe(recipe.recipe));
      // save the array of recipe data to my cache, for future happiness if we make the same request again
      CACHE[ingredient] = recipeArr;
      response.status(200).send(recipeArr);
    })
    .catch(err => {
      console.err('error', err);
      response.status(500).send('error', err);
    });
}

function Recipe(recipe) {
  this.uri = recipe.uri;
  this.name = recipe.label;
  this.image_url = recipe.image;
  this.ingredients = recipe.ingredientLines;
  this.totalTime = recipe.totalTime;
}

app.listen(PORT, () => console.log(`listening on ${PORT}`));

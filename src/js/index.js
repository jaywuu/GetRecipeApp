import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';
/** Global state of the app
  *- Search object
  *- Current recipe object
  *- Shopping list object
  *- Liked recipes
*/
const state = {};
/*
** Search controller
*/
const controlSearch = async () => {
  // 1) Get query from view
  const query = searchView.getInput(); // TODO:
  if (query) {
    // 2) New Search object
    state.search = new Search(query);
    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    // 4) Search for Recipes
    try {
      await state.search.getResults();
      // 5) Render results on UI
      clearLoader();
      searchView.renderResults(state.search.results);
    } catch (err) {
      alert('Something wrong with search');
      clearLoader();
    }
  }
};

elements.searchButton.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    // With preFix data, it goes to dataset
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.results, goToPage);
  }
});

/*
** Recipe controller
*/
const controlRecipe = async () => {
  // Read hash from url
  const id = window.location.hash.replace('#', '');
  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);
    if (state.search) {
      searchView.highlightSelected();
    }
    // Create new Recipe object
    state.recipe = new Recipe(id);
    // Get recipe data
    try {
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      // Caculate serving and time
      state.recipe.calcTime();
      state.recipe.calcServings();
      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id));
    } catch (err) {
      alert('Error processing recipe !');
    }
  }
};

//window.addEventListener('hashchange', controlRecipe);
//console.log(r);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

const controList = () => {
  // create a new list IF there is none yet
  if (!state.list) state.list = new List();
  // Add each ingredient to the List
  state.recipe.ingredients.forEach(el => {
    state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click',e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;
  // Handle delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    state.list.deleteItem(id);
    ListView.deleteItem();
    // Handle the counter update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value);
    state.list.updateCount(id, val);
  }
});

/**
 * Like Controller
*/
const controLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  // User has not yet liked current recipe
  if(!state.ikes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like current recipe
    likesView.toggleLikeBtn(true);
    // Add like to the UI list
    likesView.renderLike(newLike);
  } else {
    // Remve like to the state
    state.likes.deleteLike(currentID);
    // Toggle the like current recipes
    likesView.toggleLikeBtn(false);
    // Remove like from the UI list
    likesView.deleteLike(currentID);
  }
  ListView.toggleLikeMenu(state.likes.getNumLikes());
};
// Restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like));
})
// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec')
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn-add *')) {
    // Add ingredients to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    controlLike();
  }
});

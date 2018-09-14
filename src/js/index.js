import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';
/** Global state of the app
  *- Search object
  *- Current recipe object
  *- Shopping list object
  *- Liked recipes
*/
const state = {};
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
    await state.search.getResults();
    // 5) Render results on UI
    clearLoader();
    searchView.renderResults(state.search.results);
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

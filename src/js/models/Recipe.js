import axios from 'axios';
import { key } from '../config';

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
        const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
        this.title = res.data.recipe.title;
        this.author = res.data.recipe.publisher;
        this.image = res.data.recipe.image_url;
        this.url = res.data.recipe.source_url;
        this.ingredients = res.data.recipe.ingredients;
        //this.results = res.data.recipes;
        //console.log(this.result);
      } catch(error) {
          alert(`Something went wrong: (${error})`);
      }
    }

    calcTime() {
      // Assuming that we need 15 min for each 3 ingredients
      const numIng = this.ingredients.length;
      const periods = Math.ceil(numIng / 3);
      this.time = periods * 15;
    }

    calcServings() {
      this.servings = Math.ceil(1 / 3 * this.ingredients.length);
    }

    parseIngredients() {

      const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
      const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
      const units = [...unitsShort, 'kg', 'g'];
      const newIngredients = this.ingredients.map(el => {
        // 1) Uniform units
        let ingredient = el.toLowerCase();
        unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
        });
        // 2) Remove parentheses
        ingredient = ingredient.replace(/ *\([^)] */g, ' ');
        // 3) Parse ingredients into count, unit, and ingredient
        const arrIng = ingredient.split(' ');
        const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
        let objIng;
        if (unitIndex > -1) {
          //There is a unit
          // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval('4 + 1/2') = 4.5
          const arrCount = arrIng.slice(0, unitIndex);
          let count;
          if (arrCount.length === 1) {
            count = eval(arrIng[0].replace('-', '+'));
          } else {
            count = eval(arrIng.slice(0, unitIndex).join('+'));
          }
          objIng = {
            count,
            unit: arrIng[unitIndex],
            ingredient: arrInt.slice(unitIndex + 1).join(' ')
          }

        } else if (unitIndex === -1) {
          // There is no unit and no number in 1st position
          objIng = {
            count: 1,
            unit: '',
            ingredient // ingredient: ingredient
          }
        } else if (parseInt(arrIng[0], 10)) {
          // There is no unit, but 1st element is number
          objIng = {
            count: parseInt(arrIng[0], 10),
            unit: '',
            ingredient: arrIng.slice(1).join('')
          }
        }
        return ingredient;
      });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
      // servings
      const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
      // ingredients
      this.ingredients.forEach(ing => {
        ing.count *= (newServings / this.servings);
      });
      this.servings = newServings;

    }
}
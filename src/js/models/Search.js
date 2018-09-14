import axios from 'axios';
export default class Search {
  constructor(query) {
    this.query = query;
  }
  async getResults() {
    const key = '5517e55253af2e303e5910cd79acd7e3';
    try {
      const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
      this.results = res.data.recipes;
      //console.log(this.result);
    } catch(error) {
      alert(error);
    }
  }
}

const linkExp = /https:\/\/store.steampowered.com\/app\/[\d]+\//;
const idExp = /app\/(\d+)\//;
const itemExp = /<!-- List Items -->\s*?<a [\s\S]+? <\/a>/;
const itemExpAlt = /<a href="https:\/\/[\w\.]+\/app\/[\s\S]+?<\/a>/g;

function apiGetDetails(id) {
  /**
   * Get game details for given Steam ID through Steam API
   * @param {number} id: Steam ID
   * @return {object}: Game details
   */
  const url = `https://store.steampowered.com/api/appdetails?appids=${id}`;
  const data = UrlFetchApp.fetch(url).getContentText(); // query
  const dataJson = JSON.parse(data)[id].data;
  return dataJson;
}

function steamDetails(id) {
  /**
   * Get game details for given Steam ID
   * @param {number} id: Steam ID
   * @returns {string[]}: details
   */
  const dataJson = apiGetDetails(id);
  const releaseDate = dataJson.release_date.date;
  const { name } = dataJson;
  let price = '-';
  // show price or free if free
  if (dataJson.is_free) {
    price = 'free';
  } else {
    const priceOverview = dataJson.price_overview;
    if (priceOverview) price = `$${priceOverview.initial / 100}`;
  }
  const categories = dataJson.categories.map(category => category.description.toLowerCase());
  let lan = '-';
  let splitscreen = '-';
  let controller = '-';
  let vr = '-';
  const comingSoon = dataJson.release_date.coming_soon;
  let released = comingSoon ? 'Coming' : 'Released';
  categories.forEach(cat => {
    if (cat.includes('lan')) lan = 'LAN';
    else if (cat.includes('split')) splitscreen = 'split';
    else if (cat.includes('vr')) vr = 'VR';
    else if (cat.includes('controller')) controller = 'controller';
  });
  // replace 'released' field if early access
  const genres = dataJson.genres.map(genre => genre.description);
  if (!comingSoon) {
    genres.forEach(genre => {
      const genreLower = genre.toLowerCase();
      if (genreLower.includes('early')) released = 'Early access';
    });
  }
  return [released, releaseDate, price, genres.join(', '), vr, splitscreen, controller, lan, name]
}

function search(query, index = 0) {
  /**
   * Search game by Steam page and parse result
   * @param {string} query: Game name to search
   * @param {index} index: Index for the item in the search result to use
   * @returns {object}: 
   */
  const safe = encodeURIComponent(query);
  const url = `https://store.steampowered.com/search/?term=${safe}&category1=998`; // category to specify game only
  const html = UrlFetchApp.fetch(url).getContentText(); // fetch
  let data;
  // traverse result to given index
  if (index > 0) {
    for (let i = 0; i < index + 2; i++) data = itemExpAlt.exec(html);
  } else data = itemExp.exec(html);
  const link = linkExp.exec(data)[0];
  const id = idExp.exec(data)[1];
  return { link, id };
}

function steam(query, index = 0) {
  /**
   * Search game details by name
   * @param {string} query: Game name to search
   * @param {number} index: Index for the item in the search result to use
   * @returns {string[][]}: Game details for Google sheet row
   */
  const searchResult = search(query, index);
  const { id, link } = searchResult;
  const details = steamDetails(id);
  return [[...details, link]];
}

function steamID(id) {
  /**
   * Search game details by ID
   * @param {string} query: Game name to search
   * @param {number} index: Index for the item in the search result to use
   * @returns {string[][]}: Game details for Google sheet row
   */
  const details = steamDetails(id);
  const link = `https://store.steampowered.com/app/${id}/`;
  return [[...details, link]];
}

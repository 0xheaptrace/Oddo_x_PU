const { CITY_GUIDES, normalizeCityKey } = require('../data/cityGuides');

async function cityGuide(req, res) {
  const raw = req.query.city || req.params.city;
  const key = normalizeCityKey(raw);
  if (!key) {
    return res.json({ supported: Object.keys(CITY_GUIDES), guide: null });
  }
  return res.json({ supported: Object.keys(CITY_GUIDES), guide: CITY_GUIDES[key] });
}

module.exports = { cityGuide };


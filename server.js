const express = require('express');
const axios = require('axios');
const { Parser } = require('json2csv');
require('dotenv').config();

const app = express();
const YELP_API_KEY = process.env.YELP_API_KEY;

app.get('/search', async (req, res) => {
  const { term = 'coffee', location = 'Ontario, CA' } = req.query;

  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${YELP_API_KEY}` },
      params: { term, location, limit: 50 }
    });

    const businesses = response.data.businesses.map(b => ({
      name: b.name,
      address: b.location.display_address.join(' '),
      phone: b.phone,
      url: b.url,
      rating: b.rating,
      review_count: b.review_count
    }));

    const parser = new Parser();
    const csv = parser.parse(businesses);

    res.header('Content-Type', 'text/csv');
    res.attachment('yelp_results.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Yelp API error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

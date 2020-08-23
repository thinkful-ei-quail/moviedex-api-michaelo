require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const movieData = require('./movie-data.json');
const { response } = require('express');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

// Search Handler/Utility functions

function validateBearerToken(req, res, next) {
  const API_TOKEN = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if(!authToken || authToken.split(' ')[1] !== API_TOKEN ) {
    return res.status(401).json({ error: 'Please provide a valid Authorization Token'});
  }
  next();
}

function handleGenreSearch(req, res, next) {
  const { genre } = req.query;
  
  if(genre) {
    const genreLower = genre.toLowerCase();
    let movies = [...movieData.movies];
    movies = movies.filter(movie => movie.genre.toLowerCase().includes(genreLower));
    return res.status(200).json(movies);
  }
  next();
}

function handleCountrySearch(req, res, next) {
  const { country } = req.query;

  if (country) {
    const countryLower = country.toLowerCase();
    let movies = [...movieData.movies];
    movies = movies.filter(movie => movie.country.toLowerCase().includes(countryLower));
    return res.status(200).json(movies);
  }
  next();
}

function handleAvgVoteSearch(req, res, next) {
  const { avg_vote } = req.query;

  if (avg_vote) {
    const number = Number(avg_vote);
    let movies = [...movieData.movies];
    if(Number.isNaN(number)) {
      return res.status(400).send('avg_vote must be a number');
    }
    movies = movies.filter(movie => movie.avg_vote >= number);
    return res.status(200).json(movies);
  }
  next();
}

function getAllMovies(req, res) {
  res.status(200).json(movieData.movies);
}

//API Request/Response handler
app.get('/movie', handleGenreSearch, handleCountrySearch, handleAvgVoteSearch, getAllMovies);

app.get('/', (request, response) => {
  response.send('Hello, world!');
});

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

//Server
const PORT = process.env.PORT || 8000;

app.listen(PORT);

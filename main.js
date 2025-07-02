const ParentElement = document.querySelector(".main");
const searchInput = document.querySelector(".input");
const API_KEY = "Your_Api_Key_here";
const URL = `http://www.omdbapi.com/?s=avengers&apikey=${API_KEY}`;



const getAllMovies = async (baseUrl, maxPages = 10) => {
    let allMovies = [];
    for (let page = 1; page <= maxPages; page++) {
        try {
            const { data } = await axios.get(`${baseUrl}&page=${page}`);
            if (data.Search) {
                allMovies = allMovies.concat(data.Search);
            } else {
                break;
            }
        } catch (err) {
            console.error(err);
            break;
        }
    }
    return allMovies;
};

const createElement = (element) => document.createElement(element);

const getMovieDetails = async (imdbID) => {
    try {
        const { data } = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&apikey=3c46afb0`);
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const createMovieCard = async (movies, container) => {
    for (let i = 0; i < Math.min(movies.length, 20); i++) {
        const movie = movies[i];
        const details = await getMovieDetails(movie.imdbID);
        if (!details) continue;

        const cardContainer = createElement("div");
        cardContainer.classList.add("card", "shadow");

        const imageContainer = createElement("div");
        imageContainer.classList.add("card-image-container");
        const movieImage = createElement("img");
        movieImage.classList.add("card-image");
        movieImage.src = details.Poster;
        movieImage.alt = details.Title;
        imageContainer.appendChild(movieImage);
        cardContainer.appendChild(imageContainer);

        const cardDetails = createElement("div");
        cardDetails.classList.add("movie-details");

        const titleEle = createElement("p");
        titleEle.classList.add("title");
        titleEle.innerText = details.Title;
        cardDetails.appendChild(titleEle);

        const genreEle = createElement("p");
        genreEle.classList.add("genre");
        genreEle.innerText = `Genre: ${details.Genre}`;
        cardDetails.appendChild(genreEle);

        const movieRatings = createElement("div");
        movieRatings.classList.add("ratings");

        const starRating = createElement("div");
        starRating.classList.add("star-rating");
        const starIcon = createElement("span");
        starIcon.classList.add("material-symbols-outlined");
        starIcon.innerText = "star";
        const ratingValue = createElement("span");
        ratingValue.innerText = details.imdbRating;
        starRating.appendChild(starIcon);
        starRating.appendChild(ratingValue);
        movieRatings.appendChild(starRating);

        const lengthEle = createElement("p");
        lengthEle.innerText = details.Runtime;
        movieRatings.appendChild(lengthEle);

        cardDetails.appendChild(movieRatings);
        cardContainer.appendChild(cardDetails);
        container.appendChild(cardContainer);
    }
};

const parseSearchQuery = (query) => {
    const directorMatch = query.match(/^director:(.+)$/i);
    if (directorMatch) return { type: "director", value: directorMatch[1].trim() };

    const actorMatch = query.match(/^actor:(.+)$/i);
    if (actorMatch) return { type: "actor", value: actorMatch[1].trim() };

    return { type: "title", value: query.trim() };
};

const renderMovies = async (searchTerm) => {
    ParentElement.innerHTML = "";
    const { type, value } = parseSearchQuery(searchTerm);

    // Always search by title or a generic letter to get a broad set
    const url = `http://www.omdbapi.com/?s=${encodeURIComponent(type === "title" ? value : "a")}&apikey=3c46afb0`;
    const movies = await getAllMovies(url, 20); // fetches up to 200 movies

    if (!movies.length) {
        ParentElement.innerText = "No movies found.";
        return;
    }

    let filteredMovies = movies;

    if (type === "director" || type === "actor") {
        // Fetch details for each movie and filter
        const detailedMovies = await Promise.all(
            movies.map(movie => getMovieDetails(movie.imdbID))
        );
        filteredMovies = detailedMovies.filter(details => {
            if (!details) return false;
            if (type === "director") {
                return details.Director && details.Director.toLowerCase().includes(value.toLowerCase());
            }
            if (type === "actor") {
                return details.Actors && details.Actors.toLowerCase().includes(value.toLowerCase());
            }
            return false;
        });
    }

    if (!filteredMovies.length) {
        ParentElement.innerText = "No movies found for your criteria.";
        return;
    }

    const movieCountElement = createElement("p");
    movieCountElement.classList.add("movie-count");
    ParentElement.appendChild(movieCountElement);

    const movieListContainer = createElement('div');
    movieListContainer.classList.add('movie-list');
    ParentElement.appendChild(movieListContainer);

    await createMovieCard(filteredMovies, movieListContainer);
};

searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        const searchValue = event.target.value.trim();
        if (searchValue) renderMovies(searchValue);
    }
});

// Initial load
renderMovies("avengers");

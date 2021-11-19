import { data } from '../api/axios.js';

const searchBtn = document.getElementById('search-btn'),
	searchInput = document.getElementById('search'),
	gallery = document.getElementById('gallery');

let imageList = {},
	pageNumber = 1;

// Retrieve list of images from Flickr API
const search = async (resultsPerPage = 24, pageNumber = 1, searchTerm = '') => {
	const response = await axios.get('https://www.flickr.com/services/rest/', {
		params: {
			method: 'flickr.photos.search',
			api_key: data.key,
			user_id: data.id,
			text: searchTerm,
			extra: 'url_m',
			per_page: resultsPerPage,
			page: pageNumber,
			format: 'json',
			nojsoncallback: 1
		}
	});
	imageList = response.data;
};

// Search function
searchBtn.addEventListener('click', () => {
	console.log(searchInput.value);
	searchInput.value = '';
});

// Search for and display images
const renderGallery = async (pageNumber) => {
	await search(24, pageNumber, searchInput.value);
	for (let image of imageList.photos.photo) {
		const img = document.createElement('img');
		const imgContainer = document.createElement('div');
		imgContainer.classList.add('img-container');
		img.src = `https://farm${image.farm}.staticflickr.com/${image.server}/${image.id}_${image.secret}.jpg`;

		// Get EXIF data
		fetchExif(image.id).then((exif) => {
			console.log(exif);
			imgContainer.innerHTML = `
            <p class="img-title">${image.title}</p>
            <img class="img" id="${image.id}" src="${img.src}" alt="${image.title}">
            <div id="img-exif${image.id}">Exif</div>`;
			gallery.appendChild(imgContainer);
			document.getElementById(`img-exif${image.id}`).addEventListener('click', () => {
				console.log('click');
				document.getElementById(`img-exif${image.id}`).innerText = `Getting EXIF data...`;
				fetchExif(image.id).then((exif) => {
					console.log(exif);
					document.getElementById(`img-exif${image.id}`).innerHTML = exif;
				});
			});
		});
	}
};

const fetchExif = async (id) => {
	const response = await axios.get('https://www.flickr.com/services/rest/', {
		params: {
			method: 'flickr.photos.getExif',
			api_key: data.key,
			photo_id: id,
			format: 'json',
			nojsoncallback: 1
		}
	});
	console.log(response.data.photo);
	return response.data.photo;
};

// Initial rendering of gallery
renderGallery();
// search();

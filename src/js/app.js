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
			imgContainer.innerHTML = `
            <p class="img-title">${image.title}</p>
            <img class="img" id="${image.id}" src="${img.src}" alt="${image.title}">
			<div class="img-buttons">
            <div class="img-btn img-exif" id="img-exif${image.id}">Exif</div>
			<div class="img-btn img-fullsize" id="img-fullsize${image.id}">Full Size</div>
			</div>`;
			gallery.appendChild(imgContainer);
			document.getElementById(`img-exif${image.id}`).addEventListener('click', () => {
				document.getElementById(`img-exif${image.id}`).innerHTML = `
				<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
				<p class="exif-loading">Retrieving EXIF data...</p>`;
				// Render EXIF data under image
				fetchExif(image.id).then((exif) => {
					let exifCamera = exif.camera || 'Unavailable',
						exifExposure = 'Unavailable',
						exifAperture = 'Unavailable',
						exifISO = 'Unavailable',
						exifFocalLength = 'Unavailable';
					for (let i = 0; i < exif.exif.length; i++) {
						if (exif.exif[i].label === 'Exposure') {
							exifExposure = exif.exif[i].raw._content || 'Unavailable';
						}
						if (exif.exif[i].label === 'Aperture') {
							exifAperture = exif.exif[i].raw._content || 'Unavailable';
						}
						if (exif.exif[i].label === 'ISO Speed') {
							exifISO = exif.exif[i].raw._content || 'Unavailable';
						}
						if (exif.exif[i].label === 'Focal Length') {
							exifFocalLength = exif.exif[i].raw._content || 'Unavailable';
						}
					}
					// Checks if no EXIF data is available and displays message
					if (
						exifCamera === 'Unavailable' &&
						exifExposure === 'Unavailable' &&
						exifAperture === 'Unavailable' &&
						exifISO === 'Unavailable' &&
						exifFocalLength === 'Unavailable'
					) {
						document.getElementById(`img-exif${image.id}`).innerHTML = `<p>No EXIF data available.</p>`;
					} else {
						document.getElementById(`img-exif${image.id}`).innerHTML = `
					<p>Camera: ${exifCamera}</p>
					<p>Exposure Time: ${exifExposure}</p>
					<p>Aperture: ${exifAperture}</p>
					<p>ISO: ${exifISO}</p>
					<p>Focal Length: ${exifFocalLength}</p>`;
					}
				});
				document.getElementById(`img-exif${image.id}`).removeEventListener('click');
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
	return response.data.photo;
};

// Initial rendering of gallery
renderGallery();
// search();

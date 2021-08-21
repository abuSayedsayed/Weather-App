const conditionIcon = document.getElementById('condition')
const cityName = document.getElementById('city-name')
const main = document.getElementById('main')
const mainSmall = document.getElementById('main-small')
const temperature = document.getElementById('temp')
const pressure = document.getElementById('pressure')
const humidity = document.getElementById('humidity')
const cityInput = document.getElementById('city-input')
const collectionContainer = document.getElementById('collection-container')

const API_KEY = `76cfddb9f67233b6c3c4e0b1342e7dae`
const BASE_URL = `https://api.openweathermap.org/data/2.5/weather?&appid=${API_KEY}`
const IMG_URL = `http://openweathermap.org/img/wn`
const DEFAULT_CITY = 'Rajshahi,BD'

// Getting The User Location
navigator.geolocation.getCurrentPosition(
	(suc) => {
		console.log(suc)
		getData(suc.coords, null, (data) => {
			changeInfo(data)
		})
	},
	(err) => {
		console.log(err)
		getData(null, DEFAULT_CITY, (data) => {
			changeInfo(data)
		})
	}
)

// Sending The request
function getData(coords, city = DEFAULT_CITY, cb) {
	let url = BASE_URL
	if (coords) {
		url = `${BASE_URL}&lat=${coords.latitude}&lon=${coords.longitude}`
	} else {
		url = `${BASE_URL}&q=${city}`
	}
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			if (data.cod !== 404) {
				const dataObj = {
					icon: data.weather[0].icon,
					cityName: data.name,
					main: data.weather[0].main,
					description: data.weather[0].description,
					temperature: data.main.temp,
					pressure: data.main.pressure,
					humidity: data.main.humidity,
				}
				cb(dataObj)
			} else {
				console.log(data)
			}
		})
		.catch((err) =>
			showAlert('Please Input A City Name Which Exists In The World ')
		)
}

// Manipulating the Ui
function manipulateUi(data) {
	const singleCollection = document.createElement('div')
	singleCollection.id = 'single-collection'
	singleCollection.className =
		'bg-white my-2 p-3 d-flex justify-content-between align-items-center w-50 m-auto'
	singleCollection.innerHTML = `
            <img src="http://openweathermap.org/img/wn/${
							data.icon
						}.png" alt="" class="img-fluid bg-warning p-3 rounded" />
							<div class="info text-left">
								<span class="pb-1 my-1 text-right">${data.cityName} :</span>
								<span class="mx-1 text-info">${data.main} (${data.description})</span>
								<div class="pt-1 d-flex justify-content-center">
									<p class="font-weight-bold">
										TEMPERATURE :
										<span id="temp" class="text-danger">${(data.temperature - 273).toFixed(
											2
										)} C </span>
									</p>
									<p class="font-weight-bold px-2">
										PRESSURE :
										<span id="pressure" class="text-danger">${data.pressure} p</span>
									</p>
									<p class="font-weight-bold">
										HUMIDITY :
										<span id="humidity" class="text-danger">${data.humidity} </span>
									</p>
								</div>
							</div>
    
    `
	collectionContainer.insertAdjacentElement('afterbegin', singleCollection)
}
// Changing The top info
function changeInfo(data) {
	conditionIcon.src = `${IMG_URL}/${data.icon}.png`
	cityName.innerText = data.cityName
	main.innerText = data.main
	mainSmall.innerText = ` (${data.description})`
	temperature.innerText = `${(data.temperature - 273).toFixed(2)} C`
	pressure.innerText = data.pressure
	humidity.innerText = data.humidity
}

// Handling search functionality

cityInput.addEventListener('keypress', function (event) {
	if (event.key === 'Enter' && event.target.value !== '') {
		getData(null, event.target.value, (data) => {
			changeInfo(data)
			fetch('/api/history', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify(data),
			})
				.then((res) => res.json())
				.then((weather) => manipulateUi(data))
				.catch((err) => {
					console.log(err)
					showAlert('Cannot Set HIstory Please Try Again')
				})

			event.target.value = ''
		})
	}
})

// Showing Alert
function showAlert(err) {
	const alert = document.createElement('div')
	alert.className = 'alert alert-danger alert-dismissible fade show my-alert'
	alert.innerHTML = `
        <strong>${err}</strong>
     <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `
	document.body.appendChild(alert)
	setTimeout(() => {
		alert.remove()
	}, 5000)
}

// Getting The data from the cloud

fetch('/api/history')
	.then((res) => res.json())
	.then((data) => {
		if (data.length) {
			collectionContainer.innerHTML = ''

			data.forEach((singleData) => {
				manipulateUi(singleData)
			})
		} else {
			collectionContainer.innerHTML = `<h3 class="text-center text-danger">There Is No Searches Yet</h3>`
		}
	})
	.catch((err) => console.log('Error Occurred'))

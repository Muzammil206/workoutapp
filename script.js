'use strict';





let map, mapEvent


class workout {
    date =  new Date();
    id =(Date.now() + '').slice(-10);

    constructor(cords, distance, duration) {
        this.cords = cords;
        this.distance = distance;
        this.duration = duration;
       
       

    }

    _setdiscribtion(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
        'September', 'October', 'November', 'December'];

        this.discribtion = `${this.type[0].toUpperCase()}
         ${this.type.slice(1)} on ${months[this.date.getMonth()]} 
        ${this.date.getDate()}`
    }
}


class Runing extends workout {
    type = 'running'
    constructor (cords, distance, duration, cadence) {
        super(cords, distance, duration)
        this.cadence = cadence
        this.calcPace()
        this._setdiscribtion()
    }

    calcPace() {
       this.pace = this.duration / this.distance
       return this.pace
    }
}



class Cycling extends workout {

    type = 'cycling'
    constructor (cords, distance, duration, elevation) {
        super(cords, distance, duration)
        this.elevation =  elevation
        this.calcSpeed()
        this._setdiscribtion()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration/60)
        return this.speed
    }
}

// const run = new Runing([12, -30], 3.5, 43, 124)
// const cly = new Cycling([12, -30], 3.5, 43, 124)
// console.log(run, cly)





/////////////////////////////////////////
//////////////////////////////





const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const refreshIcon = document.querySelector('.refresh');

class App {
    #map;
    #mapEvent;
    #mapZoomlevel = 15;
    #workout = []
    constructor(){
        
        // get user position
        this._getPosition()

        /// load data from local storage
         this._getlocalStorage()
        // this._getlocalStorage()

        //////
        /// Events........................

        form.addEventListener('submit', this._newWorkout.bind(this))
    
        inputType.addEventListener('change', this._toggleElevationfield)
        containerWorkouts.addEventListener('click', this._moveTopopup.bind(this))
        
        refreshIcon.addEventListener('click', this.reSet)
    
    }

    _getPosition() {
        if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
        alert('could not get your postion')
    })

    }

    _loadMap(postion) {
        
        
            const {latitude} = postion.coords
            const { longitude } = postion.coords
            console.log(latitude)
            console.log(`https://www.google.com.ng/maps/@${latitude},${longitude}`)

            const cords = [latitude, longitude]

            this.#map = L.map('map').setView(cords, this.#mapZoomlevel);
            

          const openstreetmap =  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            })

            openstreetmap.addTo(this.#map);

        const Dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: this.#mapZoomlevel,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }) ;
         
        //    Dark.addTo(this.#map)
        const Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: this.#mapZoomlevel,
            ext: 'jpg'
        });
            // Watercolor.addTo(this.#map)


          const googleStreets = L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}',{
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3']
        });

            // googleStreets.addTo(this.#map)

        const baseMaps = {
            "OpenStreetMap": openstreetmap,
            "Google map": googleStreets,
            "Water color": Watercolor,
            "Dark mode": Dark
        };
        
        // const overlayMaps = {
        //     "Cities": cities

        // };

       


        const layerControl = L.control.layers(baseMaps).addTo(this.#map)




            // var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib});
            // var miniMap = new L.Control.MiniMap(osm2).addTo(this.#map);

            /// click of map
            
            this.#map.on('click',  this._showForm.bind(this))

            

            this.#workout.forEach(work => {
            
                this._renderworkout(work)
             });

             this.#map.on('click',  this._routeMoving.bind(this))


            
           
    }

    _showForm(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _hideForm() {
        inputCadence.value = inputDistance.value = inputDuration.value =
        inputElevation.value = ''
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    _toggleElevationfield() {
        inputElevation.closest('.form__row ').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row ').classList.toggle('form__row--hidden')
    }


    _newWorkout(e) {

        const validInput = (...inputs) =>
     inputs.every(inp => Number.isFinite(inp))
              
            
        

        
        e.preventDefault()
       

        // get data from form
      const type = inputType.value;
      const distance = +inputDistance.value;
      const duration = +inputDuration.value

      const {lat, lng} = this.#mapEvent.latlng
      let workout

        //get if the data is active


        
        
        // if the activities is runing  create a runing object
        if(type === 'running'){
             
            const cadence = +inputCadence.value;
            // check if data is valid
            if( !validInput(distance, duration, cadence)) 
              return alert('Input have to be positive number!')


          workout = new Runing( {lat, lng}, distance, duration, cadence)
         
        }


        // if the activities is cycling  create a cyclying object
        if(type === 'cycling'){
             // check if data is valid 
            const elevation = +inputElevation.value;
        
            if(!validInput(distance, duration, elevation) ) 
             
              return alert('Input have to be positive number!')


         workout = new Cycling( {lat, lng}, distance, duration, elevation)

        }

      /// add the new object to the workout array

      this.#workout.push(workout)
      

      /// render workout on the map as maker 
      this._renderworkout(workout)

      

    
      // render workout on the list
      this._workform(workout) 

    
      // clearing input  and hide form
      this._hideForm()


      /// set local storage 
        
      this._setLocalStorage()
        

    }

    _renderworkout(workout){
        L.marker(workout.cords).addTo(this.#map)
        .bindPopup(
          L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
          )
          .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.discribtion}`)
        .openPopup()


       


      
    

        // this.#workout.forEach(work => {
            
            
           
        //     const {lat} = work.cords
        //     const { lng} = work.cords
            
        //     console.log(lat, lng)

        //     const path = [lat, lng]
        //    console.log(path)



        //     const latlngs = [
        //         path,
        //         [37.77, -122.43],
        //         [34.04, -118.2]
        //     ];
            
        //       const polyline = L.polyline(latlngs, {color: 'red'}).addTo(this.#map)
        
        //    this.#map.fitBounds(polyline.getBounds())

            
        //  });


       


    

    }

    _workform(workout) {

        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.discribtion}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`;


        if(workout.type === 'running')  
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        if(workout.type === 'cycling')
        html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
        </div>
        </li> `

     form.insertAdjacentHTML('afterend', html)
    }

    /////
   

    _routeMoving(e) {


        console.log(e.latlng)
        
        const secondMaker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.#map)

        L.Routing.control({
            
            waypoints: [
                L.latLng(8.533445018144683, 4.5302367402299755),
                L.latLng(e.latlng.lat, e.latlng.lng)
            ]
            }).addTo(this.#map);
       
    }


    _moveTopopup(e) {
       const workoutEl = e.target.closest('.workout');
      
       if(!workoutEl) return;
       
       const workout = this.#workout.find(work => work.id === workoutEl.dataset.id);

       

       this.#map.setView(workout.cords, this.#mapZoomlevel, {
        animate: true,
        pan: {
            duration: 1,
        }
       })
    }


    _setLocalStorage() {
        localStorage.setItem('workout', JSON.stringify(this.#workout))
    }
    
    _getlocalStorage() {
      const data =  JSON.parse( localStorage.getItem('workout'))
      
      if(!data) return

      this.#workout = data

      this.#workout.forEach(work => {
         this._workform(work)
      });
    }


    reSet() {
        localStorage.removeItem('workout')
        location.reload()
    }


    
   


    
   

}









// add Leaflet-Geoman controls with some options to the map  







const app = new App



    form.addEventListener('submit', function(e){
        e.preventDefault()

        // clearing input 
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = ''
        //    console.log(mapEvent)

    })

   

    
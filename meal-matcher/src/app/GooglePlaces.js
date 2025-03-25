class GooglePlaces {
    constructor() {
        this.apiKey = "AIzaSyAn5SkZLs8BiORKyWW7IAnfagAzLYZAn-s";
        this.baseUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (error) => reject(error)
                );
            } else {
                reject(new Error("Geolocation is not supported by this browser."));
            }
        });
    }

    async findRestaurants(radiusMiles) {
        try {
            const userLocation = await this.getUserLocation();
            const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
            
            const url = `${this.baseUrl}?location=${userLocation.lat},${userLocation.lng}&radius=${radiusMeters}&type=restaurant&key=${this.apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== "OK") {
                throw new Error(`Google Places API error: ${data.status}`);
            }

            return data.results.map(place => ({
                name: place.name,
                image: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${this.apiKey}` : null,
                rating: place.rating || "N/A",
                priceLevel: place.price_level || "N/A",
                cuisineType: place.types.filter(type => type !== 'restaurant').join(", ") || "Unknown",
                location: place.vicinity
            }));
        } catch (error) {
            console.error("Error fetching restaurants:", error);
            return [];
        }
    }
}

// Usage Example:
const places = new GooglePlaces("YOUR_GOOGLE_API_KEY");
places.findRestaurants(5).then(restaurants => console.log(restaurants));

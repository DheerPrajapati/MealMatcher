# MealMatcher

After pulling from repo 
Go to meal-macher directory
`cd MealMatcher/meal-matcher`

Run
`npm install`

To run the application do
`npm run dev`

    meal-matcher/
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   │   ├── auth/
    │   │   │   │   └── [...nextauth]/
    │   │   │   │       └── route.js         # NextAuth.js API route
    │   │   │   ├── restaurants/
    │   │   │   │   └── route.js             # API for fetching restaurants
    │   │   │   ├── swipe/
    │   │   │   │   └── route.js             # API for handling "swipe"
    │   │   │   └── matches/
    │   │   │       └── route.js             # API for fetching user's matched restaurants
    │   │   ├── swipe/
    │   │   │   └── page.js                  # main page for swiping threw resturants
    │   │   ├── matches/
    │   │   │   └── page.js                  # page that displays users matches
    │   │   ├── login/
    │   │   │   └── page.js                  # auth page
    │   │   ├── layout.js                    # root layout with providers
    │   │   └── page.js                      # landing page
    │   ├── components/
    │   │   ├── RestaurantCard.js            # component that displays the given resturant

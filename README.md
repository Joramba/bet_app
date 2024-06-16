## Bets App
* REST API server with endpoints that allows:
  * Downloading the history of pre-match odds available at bookmakers for today's
upcoming matches (i.e., those that have not yet started).
  * Calculation of the resulting single/ako betting odds for selected matches.
* Scraper for Flashscore.pl which:
  * Retrieves current bookmaker odds for today's matches not started and saves them
to the database (every 30 minutes)


## Installation

Install docker container:

```bash
docker-compose up --build
```

Create .env file with DATABASE_URL e.g.:
```bash
DATABASE_URL="postgresql://postgres:admin@localhost:5432/bet_app?schema=public"
```

Install dependencies:
```bash
npm install
```

Create Data Base using Prisma:

```bash
npx prisma migrate dev --name init
```
```bash
npx prisma generate
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

# Matches API Documentation
This API provides endpoints to manage and calculate odds for matches. Below are the available endpoints along with their usage examples.

## Endpoints
1. Create a Match
Endpoint: POST /matches

Description: Create a new match with odds.

Request Body:

```bash
{
  "date": "2024-06-14T18:00:00.000Z",
  "league": "Test League",
  "host": "Team A",
  "guest": "Team B",
  "odds": [
    {
      "bookmaker": "Bookie1",
      "homeWin": 1.5,
      "draw": 3.5,
      "awayWin": 2.5
    }
  ]
}
```

Response:
```bash
{
  "id": 1,
  "date": "2024-06-14T18:00:00.000Z",
  "league": "Test League",
  "host": "Team A",
  "guest": "Team B",
  "createdAt": "2024-06-14T18:00:00.000Z",
  "updatedAt": "2024-06-14T18:00:00.000Z",
  "odds": [
    {
      "id": 1,
      "matchId": 1,
      "bookmaker": "Bookie1",
      "homeWin": 1.5,
      "draw": 3.5,
      "awayWin": 2.5,
      "createdAt": "2024-06-14T18:00:00.000Z",
      "updatedAt": "2024-06-14T18:00:00.000Z"
    }
  ]
}
```

2. Get Matches
Endpoint: GET /matches

Description: Retrieve all matches. You can filter matches by league.

Query Parameters:

* league (optional): Filter matches by league name.
Example Request:
```bash
  GET /matches?league=Test%20League
```

Response: 
```bash
[
  {
    "id": 1,
    "date": "2024-06-14T18:00:00.000Z",
    "league": "Test League",
    "host": "Team A",
    "guest": "Team B",
    "createdAt": "2024-06-14T18:00:00.000Z",
    "updatedAt": "2024-06-14T18:00:00.000Z",
    "odds": [
      {
        "id": 1,
        "matchId": 1,
        "bookmaker": "Bookie1",
        "homeWin": 1.5,
        "draw": 3.5,
        "awayWin": 2.5,
        "createdAt": "2024-06-14T18:00:00.000Z",
        "updatedAt": "2024-06-14T18:00:00.000Z"
      }
    ]
  }
]
```

3. Calculate AKO Odds
Endpoint: POST /matches/calculate-ako-odds

Description: Calculate the AKO (Accumulative) odds for selected matches.

Request Body:
```bash
{
  "selections": [
    {
      "matchId": 1,
      "betType": "homeWin"
    },
    {
      "matchId": 2,
      "betType": "draw"
    }
  ]
}
```

Response:
```bash
{
  "statusCode": 200,
  "odds": 5.25
}
```

Error Responses: 

* If no matches found for the given IDs:
```bash
{
  "flag": null,
  "message": "No matches found for the given IDs.",
  "statusCode": 404
}
```

* If multiple selections on the same match are not allowed:
```bash
{
  "flag": null,
  "message": "Multiple selections on match with ID 1 are not allowed.",
  "statusCode": 400
}
```

* if no odds available for a match:
```bash
{
  "flag": null,
  "message": "No odds available for match with ID 1.",
  "statusCode": 404
}
```
* If odds not available for the selected bet type:
```bash
{
  "flag": null,
  "message": "Odds not available for the selected bet type in match with ID 1.",
  "statusCode": 400
}
```

## Test

```bash
# unit tests
$ npm run test
```

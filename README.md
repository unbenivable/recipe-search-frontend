# Recipe Search Frontend

A Next.js application that allows users to search for recipes by ingredients and food images using Vertex AI.

## Features

- Search for recipes by ingredients
- Search for food images using Google's Vertex AI
- Responsive UI

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables:

Create a `.env.local` file in the root of your project with the following variables:

```
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id
```

These will be automatically loaded by Next.js.

## Google Cloud / Vertex AI Setup

1. Go to the Google Cloud Console and create a new project
2. Enable the Vertex AI API for your project
3. Create API credentials and get your API key
4. Store the API key in Railway's environment variables as `GOOGLE_CLOUD_API_KEY`
5. Store your Google Cloud project ID in Railway's environment variables as `GOOGLE_CLOUD_PROJECT_ID`

## Development

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

Deploy the application to Railway:

1. Connect your GitHub repository to Railway
2. Set the required environment variables in Railway's dashboard
3. Deploy the application

## API Endpoints

- `/api/imageSearch` - POST endpoint for searching images using Vertex AI
- `/api/detectIngredients` - POST endpoint for detecting ingredients in food images
- `/api/health` - GET endpoint for health checks (used by deployment platforms)

## Technologies Used

- Next.js
- React
- Vertex AI
- Axios

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

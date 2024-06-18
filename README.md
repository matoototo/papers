Yes, it's a good practice to include a section for the license and authors in the README file. Here's how you can format it:

# Papers

Personal research assistant that suggests recent papers from arXiv based on your preferences.

## Setup

### Database

Navigate to the `backend/database` directory and initialize the database with the following command:

```sh
cd backend/database
POSTGRES_PASSWORD=<password> EMBEDDINGS_SIZE=4096 ./init_database.sh
```

The `EMBEDDINGS_SIZE` depends on the embedding model used. This can be customized in `backend/.env`. The default is `nvidia/nv-embed-v1` which has an embedding dimension of 4096.

### Backend

1. Copy the example environment file:

```sh
cp .env.example .env
```

2. Set the necessary environment variables in the `.env` file:

- `DATABASE_URL`: The database URL (default: `postgresql://postgres:<password>@localhost:5432/postgres`)
- `NVIDIA_API_KEY`: Your NVIDIA API key

3. Install the required dependencies and start the backend server:

```sh
cd backend
npm i
npm start
```

### Frontend

1. Navigate to the `frontend` directory:

```sh
cd frontend
```

2. Install the required dependencies:

```sh
npm i
```

3. Start the frontend development server:

```sh
npm run dev
```

The app will be available at the URL shown in the terminal.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

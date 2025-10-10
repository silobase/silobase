# Silobase

Silobase is an open-source backend service that instantly turns your own database and infrastructure into a secure, production-ready REST API — without writing any backend code.

Bring your own PostgreSQL database (others coming soon), plug in your `.env` configuration, and Silobase takes care of the rest.


## 🚀 Features

- 🔌 Plug-and-play API for your existing database
- 🔐 API key-based permission control (read/write/full)
- ⚡️ Instant REST endpoints per table
- 🧩 Join support with filtering and query operators
- 🧱 Built with Fastify + Knex for performance and flexibility
- 📦 Coming soon: File storage, email integration, and support for MySQL, SQLite, MSSQL


## 📦 Quickstart

1. **Clone the repository**

```bash
git clone https://github.com/silobase/silobase.git
cd silobase
npm install
````

2. **Set up your `.env`**

```env
DB_CLIENT= pg # or mssql or mysql
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_PORT=  #5432 for postgress
DB_NAME=

API_KEY_READ=
API_KEY_WRITE=
API_KEY_FULL=
```

3. **Run the server**

```bash
npm run build && npm start
```

Your API is now live at `http://localhost:3000`.


## 📘 Example Request

**POST** `/rest/v1/users`

```bash
curl --location 'http://localhost:3000/rest/v1/users' \
  --header 'x-api-key: <API_KEY_WRITE>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "admin"
  }'
```

> Ensure the `users` table exists in your connected database.

## 📚 Documentation

Full docs are available at the silobase docs website


## 🔐 API Key Permissions

| Key Type | Permissions         |
| -------- | ------------------- |
| `read`   | GET only            |
| `write`  | POST, PUT, DELETE |
| `full`   | All operations      |


## 🛠️ Project Structure

```
silobase/
├── .env.example           # Example config
├── src/
│   ├── app.ts             # App bootstrap
│   ├── server.ts              # Entry point
│   ├── config/            # Env loaders
│   ├── auth/              # Auth + DB plugins
│   ├── routes/            # REST route handlers
│   ├── service/           # Business logic
│   ├── types/             # Type definitions
│   └── utils/             # Query parsing helpers
```

## 🧪 Roadmap

* [x] PostgreSQL, MSSQL support
* [x] MSSQL, MySQL
* [ ] SQLite
* [ ] File storage (S3, Azure Blob)
* [ ] Email provider support
* [ ] GraphQL layer (future)

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first if you'd like to suggest a feature or report a bug.

## 📜 License

- **Core (`src/core`)** — licensed under [Apache 2.0](./LICENSE)  
  Fully open source and free for self-hosted use.

- **Enterprise modules (`src/enterprise`)** — licensed under [Elastic License 2.0](./LICENSE.enterprise)  
  Source-available and usable within your organization.  
  May not be used to offer Silobase as a hosted or managed service.


This model ensures Silobase remains open and community-driven, while protecting the sustainability of enterprise development.


© 2025 Silobase Authors. All rights reserved.





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
├── server.ts              # Entry point
├── src/
│   ├── app.ts             # App bootstrap
│   ├── config/            # Env loaders
│   ├── auth/              # Auth + DB plugins
│   ├── routes/            # REST route handlers
│   ├── service/           # Business logic
│   ├── types/             # Type definitions
│   └── utils/             # Query parsing helpers
```

## 🧪 Roadmap

* [x] PostgreSQL, MSSQL support
* [ ] MSSQL, SQLite
* [ ] File storage (S3, Azure Blob)
* [ ] Email provider support
* [ ] GraphQL layer (future)

---

## 🧑‍💻 Contributing

Pull requests are welcome! Please open an issue first if you'd like to suggest a feature or report a bug.

## License

Silobase is **dual-licensed** under:

- **GNU Affero General Public License v3.0 (AGPLv3)** for open-source and community use.
- **Commercial License** for organizations that wish to embed, modify, or offer Silobase
  as a hosted service without open-sourcing their derivative work.

See [`LICENSE`](./LICENSE) for the open-source license text, and [`LICENSE-COMMERCIAL.md`](./LICENSE-COMMERCIAL.md) for commercial terms.

**In short:**
- If you’re building open-source software — you can use Silobase freely under AGPLv3.
- If you’re building closed-source or commercial software — please [contact us](mailto:adegokesimi@gmail.com) for a commercial license.

© 2025 Silobase Authors. All rights reserved.


---

## 📄 License

[MIT](LICENSE)


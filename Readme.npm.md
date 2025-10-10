# Silobase

[![npm version](https://img.shields.io/npm/v/silobase)](https://www.npmjs.com/package/silobase)
[![license](https://img.shields.io/github/license/silobase/silobase)](https://github.com/silobase/silobase/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/silobase/silobase?style=social)](https://github.com/silobase/silobase)

### Own it all. Infra-agnostic. Perfect for internal tools and enterprise back-offices.

**Silobase** is an open-source, self-hosted Backend-as-a-Service (BaaS) that instantly exposes your existing SQL databases over a clean REST API — with zero backend code.

Unlike Firebase or Supabase, Silobase doesn’t lock you into a managed database. It connects directly to your own infrastructure — **Postgres**, **MSSQL**, or **MySQL** (with **SQLite** support coming soon).

> Configure via `.env`, deploy anywhere, and keep full control of your stack.


---

## 📦 Installation

```bash
npm install -g silobase
```

Or run directly without global install:

```bash
npx silobase
```

---

## ⚙️ Setup

Silobase requires database and API keys configured via environment variables.

### Option 1: `.env` in project root

Create a `.env` file in your project root:

```ini
DB_CLIENT=pg          # pg | mssql | mysql
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
DB_PORT=5432
DB_NAME=mydb

API_KEY_READ=read_key
API_KEY_WRITE=write_key
API_KEY_FULL=admin_key

MASK_FIELDS=password,ssn
```

### Option 2: Point to a specific `.env` file

If your `.env` lives elsewhere, point to it with the `--env` flag:

```bash
npx silobase --env /path/to/my.env
```

---

## ▶️ Run

```bash
npx silobase
```

Silobase runs on port **3000** by default. Change with:

```bash
PORT=4000 npx silobase
```

---

## 📖 Example Request

```bash
curl -H "x-api-key: $API_KEY_READ" http://localhost:3000/rest/v1/users
```

---

## 🔗 Full Documentation

👉 See the full docs on GitHub: [silobase/silobase](https://github.com/silobase/silobase)


## 📜 License

- **Core (`src/core`)** — licensed under [Apache 2.0](./LICENSE)  
  Fully open source and free for self-hosted use.

- **Enterprise modules (`src/enterprise`)** — licensed under [Elastic License 2.0](./LICENSE.enterprise)  
  Source-available and usable within your organization.  
  May not be used to offer Silobase as a hosted or managed service.


This model ensures Silobase remains open and community-driven, while protecting the sustainability of enterprise development.


© 2025 Silobase Authors. All rights reserved.
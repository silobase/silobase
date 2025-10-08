# Silobase

[![npm version](https://img.shields.io/npm/v/silobase)](https://www.npmjs.com/package/silobase)
[![license](https://img.shields.io/github/license/silobase/silobase)](https://github.com/silobase/silobase/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/silobase/silobase?style=social)](https://github.com/silobase/silobase)

Silobase is an **open-source self-hosted Backend-as-a-Service (BaaS)** that exposes your own databases over a clean REST API — with **zero backend code**.

Unlike **Firebase** or **Supabase**, Silobase does not tie you to a managed database. It connects directly to your own infrastructure: **Postgres, MSSQL, or MySQL** (SQLite coming soon).

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

## License

Silobase is **dual-licensed** under:

- **GNU Affero General Public License v3.0 (AGPLv3)** for open-source and community use.
- **Commercial License** for organizations that wish to embed, modify, or offer Silobase
  as a hosted service without open-sourcing their derivative work.

See [LICENSE](https://github.com/<your-github-username>/silobase/blob/main/LICENSE) and
[LICENSE-COMMERCIAL.md](https://github.com/<your-github-username>/silobase/blob/main/LICENSE-COMMERCIAL.md)
for details.

To purchase a commercial license, please contact the GitHub author.

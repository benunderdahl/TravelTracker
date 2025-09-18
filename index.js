import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config'

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function connectDB() {
  const db = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB
  })
  db.connect()
  return db 
}

app.get("/", async (req, res) => {
  const db = connectDB()
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(result.rows);
  res.render("index.ejs", { countries: countries, total: countries.length });
  db.end();
});

app.post("/add", async (req, res) => {
  const db = connectDB()
  const country = req.body.country
  let list = []
  const response = await db.query(`SELECT id, country_code FROM countries WHERE country_name LIKE '%${country}%'`)
  list.push(response.rows[0])
  const code = list[0].country_code
  await db.query(`INSERT INTO visited_countries (country_code) VALUES ($1)`, [code])
  res.redirect("/")
  db.end()
  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

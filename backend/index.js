const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta"; 

app.use(cors());
app.use(express.json());

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "OK API is working" });
});

/* -------------------- AUTH -------------------- */
// Nota: Esto asume que existe una tabla 'users' con columnas: id (PK), username (unique), password (texto plano o hash).
// En producción NUNCA guardes passwords en texto plano; usa bcrypt.
app.post("/auth/login", async (req, res) => {
  console.log("POST /auth/login", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }
  try {
    const result = await pool.query(
      "SELECT id, password FROM users WHERE username = $1 LIMIT 1",
      [username]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    // Comparación directa (solo para demo). Sustituir por bcrypt.compare(password, user.password)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Genera token simple (NO seguro). Cambiar por JWT real en producción.
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error("Login error", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


/* -------------------- RECIPES -------------------- */

// Get all recipes
app.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching recipes");
  }
});

// Create recipe
app.post("/recipes", async (req, res) => {
  try {
    const { title, ingredients, instructions, user_id } = req.body;
    const result = await pool.query(
      "INSERT INTO recipes (title, ingredients, instructions, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, ingredients, instructions, user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error creating recipe");
  }
});

/* -------------------- MEAL PLANS -------------------- */

// Get weekly meal plan for a user
app.get("/meal-plans/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      `SELECT m.weekday, m.meal_type, r.title
       FROM meal_plans m
       JOIN recipes r ON m.recipe_id = r.id
       WHERE m.user_id = $1
       ORDER BY 
         CASE m.weekday
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 21
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END,
         m.meal_type`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching meal plan");
  }
});

// Assign a recipe to a day/meal_type
app.post("/meal-plans", async (req, res) => {
  try {
    const { user_id, recipe_id, weekday, meal_type } = req.body;
    const result = await pool.query(
      "INSERT INTO meal_plans (user_id, recipe_id, weekday, meal_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, recipe_id, weekday, meal_type]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error creating meal plan");
  }
});


// Start server
app.listen(4000, () => {
  console.log("Server working on http://localhost:4000");
});
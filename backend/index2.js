const express = require("express");
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta";

// const username = "victor";
// const plainPassword = "1234";
// const email = "victor@example.com"

// const hashedPassword = await bcrypt.hash(plainPassword, 10);

// await pool.query(
//   "INSERT INTO users (username,email, password) VALUES ($1, $2, $3)",
//   [username,email, hashedPassword]
// );



app.use(cors());
app.use(express.json());

// -------------------- AUTH --------------------

app.get("/create-user", async (req, res) => {
  try {
    const username = "victor";
    const plainPassword = "1234";
    const email = "victor@example.com";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log(hashedPassword);

    await pool.query(
      "INSERT INTO users (username,email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.send("User created");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error creating user");
  }
});

// Login con JWT
app.post("/auth/login", async (req, res) => {
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

    // Verificar password con bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generar JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, userId: user.id });

  } catch (err) {
    console.error("Login error", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware para rutas protegidas
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token required" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

//---------------------USERS------------------------

app.get("/users", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Users fetch error", err.message);
    res.status(500).send("Error fetching users");
  }
});


// -------------------- RECIPES --------------------

// Get all recipes (protegido)
app.get("/recipes", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching recipes");
  }
});

// Create recipe (protegido)
app.post("/recipes", authMiddleware, async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const user_id = req.user.userId; // del token JWT
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

// GET /my-recipes → solo recetas del usuario autenticado
app.get("/my-recipes", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // del token JWT
    const result = await pool.query(
      "SELECT * FROM recipes WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching user recipes" });
  }
});


// -------------------- MEAL PLANS --------------------

// Get weekly meal plan for a user (protegido)
app.get("/meal-plans/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    // Solo el usuario dueño puede acceder
    if (parseInt(userId) !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await pool.query(
      `SELECT m.weekday, m.meal_type, r.title
       FROM meal_plans m
       JOIN recipes r ON m.recipe_id = r.id
       WHERE m.user_id = $1
       ORDER BY 
         CASE m.weekday
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
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

// Assign a recipe to a day/meal_type (protegido)
app.post("/meal-plans", authMiddleware, async (req, res) => {
  try {
    const { recipe_id, weekday, meal_type } = req.body;
    const user_id = req.user.userId; // del token JWT

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

// -------------------- TEST --------------------
app.get("/", (req, res) => {
  res.json({ message: "OK API 2 hashed is working" });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server working on http://localhost:${PORT}`);
});
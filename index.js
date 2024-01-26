const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pool = new Pool({
  connectionString:
    "postgres://mvfjlexr:JjRkwT59oY4i6rIZFvf15Pw9tFBxojJ2@kesavan.db.elephantsql.com/mvfjlexr",
});
pool.connect((error, client, done) => {
  if (error) {
    console.log("error connecting to DB");
  } else {
    console.log("connected to db");
  }
});

pool.query(
  `
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL, 
    completed VARCHAR(255) NOT NULL
  )
`,
  (err, result) => {
    if (err) {
      console.error("Error creating the tasks table", err);
    } else {
      console.log("tasks table created successfully");
    }
  }
);

// post API
app.post("/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Both title and description are required" });
  }

  pool.query(
    "INSERT INTO tasks (title, description, completed) VALUES ($1, $2, $3)",
    [title, description, false],
    (err, result) => {
      if (err) {
        console.error("Error inserting task into the database", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res
          .status(201)
          .json({ message: "task created successfully", data: result });
      }
    }
  );
});

// Get API
app.get("/tasks", (req, res) => {
  pool.query(
    "SELECT COUNT(*) as total_tasks FROM tasks; SELECT * FROM tasks;",
    (err, result) => {
      if (err) {
        console.error("Error executing SQL query", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        const totalTasks = result[0].rows[0].total_tasks;
        const tasks = result[1].rows;
        const response = {
          total_tasks: totalTasks,
          tasks: tasks,
        };

        res.json(response);
      }
    }
  );
});

//put API
app.put("/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Both title and description are required" });
  }

  pool.query(
    "UPDATE tasks SET title = $1, description = $2 WHERE id = $3",
    [title, description, taskId],
    (err, result) => {
      if (err) {
        console.error("Error updating task in the database", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json({ message: "Task updated successfully", data: result });
      }
    }
  );
});

//Delete API
app.delete("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  pool.query("DELETE FROM tasks WHERE id = $1", [taskId], (err, result) => {
    if (err) {
      console.error("Error deleting task from the database", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      res.json({ message: "Task deleted successfully", data: result });
    }
  });
});

// Task completed API
app.put("/completed/:id", (req, res) => {
  const taskId = req.params.id;

  pool.query(
    "UPDATE tasks SET completed = $1 WHERE id = $2",
    ["true", taskId],
    (err, result) => {
      if (err) {
        console.error("Error updating task in the database", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.json({ message: "Task updated successfully", data: result });
      }
    }
  );
});

const port = 5000;
app.listen(port, () => {
  console.log("Listened to port" + "" + port);
});

app.get("/", (req, res) => {
  res.send("hello and welcome to task server");
});

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const escape = require('escape-html');


const app = express();
const port = 3001;

// Configurer les informations de connexion à la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test',
  password: 'example',
  port: 5432, // Port par défaut pour PostgreSQL
});

// Analyser les données POST du formulaire
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Afficher le formulaire de login
app.get('/', (req, res) => {
  res.send(`
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Nom d'utilisateur" required>
      <input type="password" name="password" placeholder="Mot de passe" required>
      <button type="submit">Se connecter</button>
    </form>
  `);
});

// Gérer la soumission du formulaire de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  const client = await pool.connect();

  try {

    const result = await client.query(
      `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`,

    );
    console.log(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`);

    // Vérifier si l'utilisateur existe dans la base de données
    if (result.rows.length >= 1) {
      // Utilisateur authentifié
      res.send('Authentification réussie');
    } else {
      // Informations de connexion incorrectes
      res.send('Nom d\'utilisateur ou mot de passe incorrect');
    }
  } catch (err) {
    console.error('Erreur lors de l\'exécution de la requête', err);
    res.send('Une erreur s\'est produite lors de l\'authentification');
  } finally {
    client.release();
  }
});

app.post('/Register', async (req, res) => {
  const { nom, prenom, username, password } = req.body;
  const client = await pool.connect();
  try {
    const query = {
      text: `INSERT INTO users (nom, prenom, username,password) values (?,?,?,?)`,
      values: [nom, prenom, username, password]
    }
    const result = await client.query(query);
    res.send(result)
  } catch (error) {
    console.log(error)
  }


})

app.get('/users', async (req, res) => {
  const client = await pool.connect();
  const query = `SELECT username, password FROM users;`;
  const result = await client.query(query);
  return res.status(200).send(`<table><tr><th>ID</th><th>Username</th><th>Password</th></tr>${result.rows.map((row, index) => `<tr><td>${index}</td><td>${row.username}</td><td>${row.password}</td></tr>`).join('')}</table><form action="/add" method="POST">
  <input type="text" name="username" placeholder="Nom d'utilisateur" required>
  <input type="password" name="password" placeholder="Mot de passe" required>
  <button type="submit">Se connecter</button>
</form>`)
})

app.post('/add', async (req, res) => {
  const client = await pool.connect();
  try {
    const { username, password } = req.body;
    console.log(req.body)

    const query = `INSERT INTO users(username, password) VALUES('${username}', '${password}')`;

    const result = await client.query(query);
  } finally {

    client.release()
  }

  // Vérifier si l'utilisateur existe dans la base de données
  return res.redirect('/users')
})

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});


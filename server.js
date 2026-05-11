const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Garantir que a pasta data existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper para ler JSON
const readJSON = (filename) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper para escrever JSON
const writeJSON = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Inicializar dados padrão
const initDefaultData = () => {
  // Games padrão
  const games = readJSON('games.json');
  if (games.length === 0) {
    const defaultGames = [
      {
        id: "1",
        title: "A Revolução da Computação",
        description: "Conheça Alan Turing e ajude a construir o primeiro computador!",
        category: "tecnologia",
        estimated_time: 10,
        difficulty: "médio",
        historical_context: {
          period: "1940 - Segunda Guerra Mundial",
          key_figure: "Alan Turing"
        },
        color: "from-blue-500 to-cyan-600",
        icon: "💻"
      },
      {
        id: "2",
        title: "Energia do Futuro",
        description: "Descubra a energia solar com Edmond Becquerel!",
        category: "sustentabilidade",
        estimated_time: 10,
        difficulty: "médio",
        historical_context: {
          period: "1839 - França",
          key_figure: "Edmond Becquerel"
        },
        color: "from-green-500 to-emerald-600",
        icon: "🌱"
      },
      {
        id: "3",
        title: "A Magia do Cinema",
        description: "Crie a primeira animação com Émile Reynaud!",
        category: "cultura_criativo",
        estimated_time: 10,
        difficulty: "fácil",
        historical_context: {
          period: "1892 - Paris",
          key_figure: "Émile Reynaud"
        },
        color: "from-purple-500 to-pink-600",
        icon: "🎨"
      },
      {
        id: "4",
        title: "Florence Nightingale - Estatística na Saúde",
        description: "Use dados e estatística para salvar vidas!",
        category: "healthtech",
        estimated_time: 12,
        difficulty: "médio",
        historical_context: {
          period: "1854 - Guerra da Crimeia",
          key_figure: "Florence Nightingale"
        },
        color: "from-red-500 to-pink-600",
        icon: "🏥"
      },
      {
        id: "5",
        title: "Norman Borlaug - A Revolução Verde",
        description: "Crie plantas mais resistentes e acabe com a fome!",
        category: "agronegocio",
        estimated_time: 12,
        difficulty: "médio",
        historical_context: {
          period: "1960 - México",
          key_figure: "Norman Borlaug"
        },
        color: "from-lime-500 to-green-600",
        icon: "🌾"
      },
      {
        id: "6",
        title: "Marie Curie - A Ciência Radioativa",
        description: "Descubra os elementos rádio e polônio!",
        category: "genia_ciencia",
        estimated_time: 12,
        difficulty: "difícil",
        historical_context: {
          period: "1898 - Paris",
          key_figure: "Marie Curie"
        },
        color: "from-indigo-500 to-purple-600",
        icon: "🔬"
      }
    ];
    writeJSON('games.json', defaultGames);
  }

  // Jobs padrão
  const jobs = readJSON('jobOpportunities.json');
  if (jobs.length === 0) {
    const defaultJobs = [
      {
        id: "1",
        title: "Desenvolvedor Front-end",
        company: "TechInclui",
        location: "Remoto",
        country: "Brasil",
        job_type: "remoto",
        description: "Vaga afirmativa para pessoas neurodivergentes. Ambiente acolhedor e flexível.",
        salary_range: "R$ 5.000 - R$ 8.000",
        accessibility_features: ["Horário flexível", "Mentoria", "Ambiente silencioso"],
        is_active: true,
        created_date: new Date().toISOString(),
        posted_by_ai: false,
        application_url: "https://techinclui.com/carreiras"
      },
      {
        id: "2",
        title: "Analista de Dados",
        company: "DataForAll",
        location: "São Paulo - SP",
        country: "Brasil",
        job_type: "hibrido",
        description: "Buscamos pessoas com TDAH ou autismo para trazer novas perspectivas.",
        salary_range: "R$ 6.000 - R$ 9.000",
        accessibility_features: ["Ferramentas de apoio", "Pausas flexíveis"],
        is_active: true,
        created_date: new Date().toISOString(),
        posted_by_ai: false,
        application_url: "https://dataforall.com/vagas"
      }
    ];
    writeJSON('jobOpportunities.json', defaultJobs);
  }
};

initDefaultData();

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registrar usuário
app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name } = req.body;
  
  const users = readJSON('users.json');
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }
  
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // Em produção: bcrypt.hashSync(password, 10)
    full_name,
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  writeJSON('users.json', users);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const users = readJSON('users.json');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    user: userWithoutPassword,
    token: `mock_token_${Date.now()}` 
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Mock: aceita qualquer token que comece com "mock_token_"
  if (!token || !token.startsWith('mock_token_')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  
  // Extrair email do token ou usar mock
  res.json({ email: 'usuario@teste.com', full_name: 'Usuário Teste' });
});

// ==================== ROTAS DE USER PROFILE ====================

app.get('/api/user-profiles', (req, res) => {
  const { created_by } = req.query;
  let profiles = readJSON('userProfiles.json');
  
  if (created_by) {
    profiles = profiles.filter(p => p.created_by === created_by);
  }
  
  res.json(profiles);
});

app.post('/api/user-profiles', (req, res) => {
  const profiles = readJSON('userProfiles.json');
  const newProfile = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  profiles.push(newProfile);
  writeJSON('userProfiles.json', profiles);
  res.status(201).json(newProfile);
});

app.put('/api/user-profiles/:id', (req, res) => {
  const profiles = readJSON('userProfiles.json');
  const index = profiles.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Perfil não encontrado' });
  }
  
  profiles[index] = { ...profiles[index], ...req.body };
  writeJSON('userProfiles.json', profiles);
  res.json(profiles[index]);
});

// ==================== ROTAS DE GAMES ====================

app.get('/api/games', (req, res) => {
  const games = readJSON('games.json');
  res.json(games);
});

app.get('/api/games/filter', (req, res) => {
  const { category } = req.query;
  let games = readJSON('games.json');
  
  if (category) {
    games = games.filter(g => g.category === category);
  }
  
  res.json(games);
});

// ==================== ROTAS DE GAME PROGRESS ====================

app.get('/api/game-progress', (req, res) => {
  const { created_by, game_id } = req.query;
  let progress = readJSON('gameProgress.json');
  
  if (created_by) {
    progress = progress.filter(p => p.created_by === created_by);
  }
  if (game_id) {
    progress = progress.filter(p => p.game_id === game_id);
  }
  
  res.json(progress);
});

app.post('/api/game-progress', (req, res) => {
  const progress = readJSON('gameProgress.json');
  const newProgress = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  progress.push(newProgress);
  writeJSON('gameProgress.json', progress);
  res.status(201).json(newProgress);
});

app.put('/api/game-progress/:id', (req, res) => {
  const progress = readJSON('gameProgress.json');
  const index = progress.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Progresso não encontrado' });
  }
  
  progress[index] = { ...progress[index], ...req.body };
  writeJSON('gameProgress.json', progress);
  res.json(progress[index]);
});

// ==================== ROTAS DE CHARACTERS ====================

app.get('/api/characters', (req, res) => {
  const { created_by, is_active } = req.query;
  let characters = readJSON('characters.json');
  
  if (created_by) {
    characters = characters.filter(c => c.created_by === created_by);
  }
  if (is_active !== undefined) {
    characters = characters.filter(c => c.is_active === (is_active === 'true'));
  }
  
  res.json(characters);
});

app.post('/api/characters', (req, res) => {
  const characters = readJSON('characters.json');
  const newCharacter = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  characters.push(newCharacter);
  writeJSON('characters.json', characters);
  res.status(201).json(newCharacter);
});

app.put('/api/characters/:id', (req, res) => {
  const characters = readJSON('characters.json');
  const index = characters.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Personagem não encontrado' });
  }
  
  characters[index] = { ...characters[index], ...req.body };
  writeJSON('characters.json', characters);
  res.json(characters[index]);
});

// ==================== ROTAS DE POSTS (FEED) ====================

app.get('/api/posts', (req, res) => {
  let posts = readJSON('posts.json');
  posts = posts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  res.json(posts);
});

app.post('/api/posts', (req, res) => {
  const posts = readJSON('posts.json');
  const newPost = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  posts.push(newPost);
  writeJSON('posts.json', posts);
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', (req, res) => {
  const posts = readJSON('posts.json');
  const index = posts.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Post não encontrado' });
  }
  
  posts[index] = { ...posts[index], ...req.body };
  writeJSON('posts.json', posts);
  res.json(posts[index]);
});

// ==================== ROTAS DE HYPERFOCUS DISCOVERY ====================

app.get('/api/hyperfocus-discoveries', (req, res) => {
  const { created_by } = req.query;
  let discoveries = readJSON('hyperfocusDiscoveries.json');
  
  if (created_by) {
    discoveries = discoveries.filter(d => d.created_by === created_by);
  }
  
  res.json(discoveries);
});

app.post('/api/hyperfocus-discoveries', (req, res) => {
  const discoveries = readJSON('hyperfocusDiscoveries.json');
  const newDiscovery = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  discoveries.push(newDiscovery);
  writeJSON('hyperfocusDiscoveries.json', discoveries);
  res.status(201).json(newDiscovery);
});

// ==================== ROTAS DE JOB OPPORTUNITIES ====================

app.get('/api/job-opportunities', (req, res) => {
  const { is_active } = req.query;
  let jobs = readJSON('jobOpportunities.json');
  
  if (is_active !== undefined) {
    jobs = jobs.filter(j => j.is_active === (is_active === 'true'));
  }
  
  res.json(jobs);
});

app.post('/api/job-opportunities', (req, res) => {
  const jobs = readJSON('jobOpportunities.json');
  const newJob = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  jobs.push(newJob);
  writeJSON('jobOpportunities.json', jobs);
  res.status(201).json(newJob);
});

app.put('/api/job-opportunities/:id', (req, res) => {
  const jobs = readJSON('jobOpportunities.json');
  const index = jobs.findIndex(j => j.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Vaga não encontrada' });
  }
  
  jobs[index] = { ...jobs[index], ...req.body };
  writeJSON('jobOpportunities.json', jobs);
  res.json(jobs[index]);
});

// ==================== ROTAS DE PROJECTS ====================

app.get('/api/projects', (req, res) => {
  const { created_by, is_public } = req.query;
  let projects = readJSON('projects.json');
  
  if (created_by) {
    projects = projects.filter(p => p.created_by === created_by);
  }
  if (is_public !== undefined) {
    projects = projects.filter(p => p.is_public === (is_public === 'true'));
  }
  
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const projects = readJSON('projects.json');
  const newProject = { 
    ...req.body, 
    id: Date.now().toString(),
    created_date: new Date().toISOString()
  };
  projects.push(newProject);
  writeJSON('projects.json', projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req, res) => {
  const projects = readJSON('projects.json');
  const index = projects.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  
  projects[index] = { ...projects[index], ...req.body };
  writeJSON('projects.json', projects);
  res.json(projects[index]);
});

// ==================== ROTAS DE UPLOAD ====================

app.post('/api/upload', (req, res) => {
  // Simular upload (em produção usar multer)
  const fileUrl = `https://storage.mock.com/${Date.now()}.jpg`;
  res.json({ file_url: fileUrl });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📁 Dados salvos em: ${dataDir}`);
  console.log(`\n📋 Rotas disponíveis:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   CRUD   /api/user-profiles`);
  console.log(`   CRUD   /api/games`);
  console.log(`   CRUD   /api/game-progress`);
  console.log(`   CRUD   /api/characters`);
  console.log(`   CRUD   /api/posts`);
  console.log(`   CRUD   /api/hyperfocus-discoveries`);
  console.log(`   CRUD   /api/job-opportunities`);
  console.log(`   CRUD   /api/projects`);
});

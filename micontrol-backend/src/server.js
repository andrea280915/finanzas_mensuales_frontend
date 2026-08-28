import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ExcelJS from 'exceljs';
import { body, query as queryParam, param, validationResult } from 'express-validator';
import { query, initDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_dev';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());  

// Inicializar tablas en PostgreSQL al arrancar
initDB().catch((err) => {
  console.error(' Error crítico al conectar la BD:', err);
});

// Middleware de Validación
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

// Middleware de Autenticación JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// 1. ENDPOINTS DE AUTENTICACIÓN
// ==========================================

// Registro de usuario
app.post(
  '/api/auth/register',
  [
    body('name').trim().notEmpty().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userResult = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );

      const newUser = userResult.rows[0];
      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

      // Insertar categorías por defecto para el usuario nuevo
      const defaultCategories = [
        ['Comida & Súper', 'gasto', 'necesidad', '#f59e0b'],
        ['Servicios Básicos', 'gasto', 'necesidad', '#3b82f6'],
        ['Vivienda & Renta', 'gasto', 'necesidad', '#8b5cf6'],
        ['Transporte', 'gasto', 'necesidad', '#06b6d4'],
        ['Entretenimiento', 'gasto', 'deseo', '#ef4444'],
        ['Sueldo Principal', 'ingreso', 'ninguno', '#10b981'],
        ['Aporte a Ahorro', 'ahorro', 'ninguno', '#059669']
      ];

      for (const cat of defaultCategories) {
        await query(
          'INSERT INTO categories (user_id, name, type, group_type, color) VALUES ($1, $2, $3, $4, $5)',
          [newUser.id, ...cat]
        );
      }

      res.status(201).json({
        user: newUser,
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login de usuario
app.post(
  '/api/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

// Verificar Token / Obtener Usuario Actual
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. ENDPOINTS DE CATEGORÍAS PERSONALIZADAS
// ==========================================

app.get('/api/categories', authenticateToken, async (req, res, next) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE user_id = $1', [req.user.id]);
    res.json(categories.rows);
  } catch (error) {
    next(error);
  }
});

app.post(
  '/api/categories',
  [
    authenticateToken,
    body('name').trim().notEmpty().escape(),
    body('type').isIn(['ingreso', 'gasto', 'ahorro']),
    body('group_type').optional().isIn(['necesidad', 'deseo', 'ninguno']),
    body('color').optional().trim().escape(),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { name, type, group_type = 'ninguno', color = '#64748b' } = req.body;
      const result = await query(
        'INSERT INTO categories (user_id, name, type, group_type, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.user.id, name, type, group_type, color]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

app.delete('/api/categories/:id', [authenticateToken, param('id').isInt().toInt(), validateRequest], async (req, res, next) => {
  try {
    const result = await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. ENDPOINTS DE TRANSACCIONES (Filtrados por Usuario)
// ==========================================

app.get('/api/transactions', authenticateToken, async (req, res, next) => {
  try {
    const transactions = await query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json({ data: transactions.rows });
  } catch (error) {
    next(error);
  }
});

app.post(
  '/api/transactions',
  [
    authenticateToken,
    body('type').isIn(['ingreso', 'gasto', 'ahorro']),
    body('amount').isFloat({ gt: 0 }),
    body('category').trim().notEmpty().escape(),
    body('date').isISO8601(),
    body('note').optional().trim().escape(),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { type, amount, category, date, note } = req.body;
      const result = await query(
        'INSERT INTO transactions (user_id, type, amount, category, date, note) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [req.user.id, type, amount, category, date, note || category]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

app.delete('/api/transactions/:id', [authenticateToken, param('id').isInt().toInt(), validateRequest], async (req, res, next) => {
  try {
    const result = await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json({ message: 'Transacción eliminada' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. ENDPOINTS DE METAS DE AHORRO (Filtrados por Usuario)
// ==========================================

app.get('/api/goals', authenticateToken, async (req, res, next) => {
  try {
    const goals = await query('SELECT * FROM saving_goals WHERE user_id = $1', [req.user.id]);
    res.json(goals.rows);
  } catch (error) {
    next(error);
  }
});

app.post(
  '/api/goals',
  [
    authenticateToken,
    body('name').trim().notEmpty().escape(),
    body('target').isFloat({ gt: 0 }),
    body('current').optional().isFloat({ min: 0 }),
    body('color').optional().trim().escape(),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { name, target, current = 0, color = 'bg-emerald-500' } = req.body;
      const result = await query(
        'INSERT INTO saving_goals (user_id, name, target, current, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.user.id, name, target, current, color]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  '/api/goals/:id',
  [
    authenticateToken,
    param('id').isInt().toInt(),
    body('current').isFloat({ min: 0 }),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { current } = req.body;
      const result = await query(
        'UPDATE saving_goals SET current = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [current, id, req.user.id]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: 'Meta no encontrada' });
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

app.delete('/api/goals/:id', [authenticateToken, param('id').isInt().toInt(), validateRequest], async (req, res, next) => {
  try {
    const result = await query('DELETE FROM saving_goals WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ message: 'Meta eliminada' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. EXPORTACIÓN A EXCEL (.XLSX)
// ==========================================

app.get(
  '/api/export/excel',
  [
    authenticateToken,
    queryParam('month').isInt({ min: 0, max: 11 }),
    queryParam('year').isInt({ min: 2000, max: 2100 }),
    validateRequest
  ],
  async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const formattedMonth = String(Number(month) + 1).padStart(2, '0');
      const monthYearFilter = `${year}-${formattedMonth}`;

      const transactions = await query(
        `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, type, category, amount, note 
         FROM transactions 
         WHERE user_id = $1 AND TO_CHAR(date, 'YYYY-MM') = $2
         ORDER BY date DESC`,
        [req.user.id, monthYearFilter]
      );

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte Financiero');

      worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Tipo', key: 'type', width: 12 },
        { header: 'Categoría', key: 'category', width: 25 },
        { header: 'Monto (S/)', key: 'amount', width: 15 },
        { header: 'Nota', key: 'note', width: 30 }
      ];

      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' }
      };

      transactions.rows.forEach((tx) => {
        worksheet.addRow(tx);
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Reporte_Financiero_${monthYearFilter}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
);

// Middleware global de errores
app.use((err, req, res, next) => {
  console.error(' [Error API]:', err.stack || err.message);
  res.status(err.status || 500).json({ status: 'error', message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(` Servidor activo en http://localhost:${PORT}`);
});
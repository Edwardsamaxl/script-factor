import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePersona } from '../services/personaGenerator.js';
import { rewritePersona } from '../services/personaRewriter.js';
import { loadBuiltInPersonas, loadUserPersonas, saveUserPersonas } from '../services/dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


/**
 * GET /api/personas/built-in
 * Returns the list of built-in personas (merged with user stats)
 */
router.get('/built-in', (req, res) => {
  try {
    const builtIn = loadBuiltInPersonas();
    const userStats = loadUserPersonas().filter(p => p.builtInId);

    // 合并统计数据
    const merged = builtIn.map(p => {
      const stats = userStats.find(s => s.builtInId === p.id);
      if (stats) {
        return {
          ...p,
          usageCount: p.usageCount + (stats.usageCount || 0),
          likeCount: p.likeCount + (stats.likeCount || 0),
          imageUrl: stats.imageUrl || p.imageUrl
        };
      }
      return p;
    });

    res.json({
      success: true,
      data: merged
    });
  } catch (error) {
    console.error('Error reading built-in personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load built-in personas'
    });
  }
});

/**
 * GET /api/personas
 * Returns all user-created personas
 */
router.get('/', (req, res) => {
  try {
    const personas = loadUserPersonas();
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Error reading user personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user personas'
    });
  }
});

/**
 * GET /api/personas/favorites
 * Returns IDs of personas the user has favorited
 */
router.get('/favorites', (req, res) => {
  try {
    const personas = loadUserPersonas();
    // 内置人物：用 stats 记录的 isFavorited 判断
    const favoritedBuiltInIds = personas
      .filter(p => p.builtInId && p.isFavorited)
      .map(p => p.builtInId);
    // 用户创建的人物：用 isFavorited 判断
    const favoritedUserIds = personas
      .filter(p => p.creator === 'user' && p.isFavorited)
      .map(p => p.id);

    res.json({
      success: true,
      data: {
        favoritedBuiltInIds,
        favoritedUserIds
      }
    });
  } catch (error) {
    console.error('Error reading favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load favorites'
    });
  }
});

/**
 * POST /api/personas
 * Create a new user persona (direct save, no AI generation)
 */
router.post('/', (req, res) => {
  try {
    const { name, avatar, coreView, speakingStyle, actionStyle, background, imagePrompt, isPublic } = req.body;

    if (!name || !coreView || !speakingStyle || !actionStyle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, coreView, speakingStyle, actionStyle'
      });
    }

    if (!imagePrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: imagePrompt (must go through rewrite first)'
      });
    }

    const personas = loadUserPersonas();
    const timestamp = Date.now();
    const newPersona = {
      id: `user-${timestamp}`,
      name,
      avatar: avatar || '👤',
      creator: 'user',
      coreView,
      speakingStyle,
      actionStyle,
      background: background || '',
      imagePrompt,
      imageUrl: null,
      exampleDialogs: [],
      usageCount: 0,
      likeCount: 0,
      isPublic: isPublic ?? false,
      isPremium: false,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    personas.unshift(newPersona);
    saveUserPersonas(personas);

    res.json({
      success: true,
      data: newPersona
    });
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create persona'
    });
  }
});

/**
 * PUT /api/personas/:id
 * Update a user persona
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, coreView, speakingStyle, actionStyle, background, imagePrompt, isPublic } = req.body;

    const personas = loadUserPersonas();
    const index = personas.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Persona not found'
      });
    }

    personas[index] = {
      ...personas[index],
      name: name ?? personas[index].name,
      avatar: avatar ?? personas[index].avatar,
      coreView: coreView ?? personas[index].coreView,
      speakingStyle: speakingStyle ?? personas[index].speakingStyle,
      actionStyle: actionStyle ?? personas[index].actionStyle,
      background: background ?? personas[index].background,
      imagePrompt: imagePrompt ?? personas[index].imagePrompt,
      isPublic: isPublic ?? personas[index].isPublic,
      updatedAt: Date.now()
    };

    saveUserPersonas(personas);

    res.json({
      success: true,
      data: personas[index]
    });
  } catch (error) {
    console.error('Error updating persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update persona'
    });
  }
});

/**
 * POST /api/personas/:id/like
 * 点赞或取消点赞一个人设
 */
router.post('/:id/like', (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    // 尝试在用户人物中查找并更新
    let personas = loadUserPersonas();
    const index = personas.findIndex(p => p.id === id);

    if (index >= 0) {
      const delta = action === 'unlike' ? -1 : 1;
      personas[index] = {
        ...personas[index],
        isFavorited: action !== 'unlike',
        likeCount: Math.max(0, (personas[index].likeCount || 0) + delta),
        updatedAt: Date.now()
      };
      saveUserPersonas(personas);
      return res.json({ success: true, data: { id, likeCount: personas[index].likeCount } });
    }

    // 内置人物：在 user-personas.json 中创建/更新统计记录，用 isFavorited 标记收藏
    const builtInPersonas = loadBuiltInPersonas();
    const builtInSource = builtInPersonas.find(p => p.id === id);

    if (builtInSource) {
      const statsIndex = personas.findIndex(p => p.builtInId === id);

      if (statsIndex >= 0) {
        personas[statsIndex] = {
          ...personas[statsIndex],
          isFavorited: action !== 'unlike',
          likeCount: Math.max(0, (personas[statsIndex].likeCount || 0) + (action === 'unlike' ? -1 : 1)),
          updatedAt: Date.now()
        };
      } else {
        personas.unshift({
          id: `stats-${Date.now()}`,
          builtInId: id,
          isFavorited: action !== 'unlike',
          likeCount: action === 'unlike' ? 0 : 1,
          usageCount: 0,
          updatedAt: Date.now()
        });
      }
      saveUserPersonas(personas);
      const stats = personas.find(p => p.builtInId === id);
      // 返回总点赞数 = 内置初始值 + 用户新增值
      const totalLikeCount = (builtInSource.likeCount || 0) + (stats?.likeCount || 0);
      return res.json({ success: true, data: { id, likeCount: totalLikeCount } });
    }

    return res.status(404).json({ success: false, error: 'Persona not found' });
  } catch (error) {
    console.error('Error liking persona:', error);
    res.status(500).json({ success: false, error: 'Failed to like persona' });
  }
});

/**
 * POST /api/personas/:id/use
 * 记录人设使用次数
 */
router.post('/:id/use', (req, res) => {
  try {
    const { id } = req.params;

    // 尝试在用户人物中查找并更新
    let personas = loadUserPersonas();
    const index = personas.findIndex(p => p.id === id);

    if (index >= 0) {
      personas[index].usageCount = (personas[index].usageCount || 0) + 1;
      personas[index].updatedAt = Date.now();
      saveUserPersonas(personas);
      return res.json({ success: true, data: { id, usageCount: personas[index].usageCount } });
    }

    // 内置人物
    const builtInPersonas = loadBuiltInPersonas();
    const isBuiltIn = builtInPersonas.some(p => p.id === id);

    if (isBuiltIn) {
      const statsIndex = personas.findIndex(p => p.builtInId === id);

      if (statsIndex >= 0) {
        personas[statsIndex].usageCount = (personas[statsIndex].usageCount || 0) + 1;
        personas[statsIndex].updatedAt = Date.now();
      } else {
        personas.unshift({
          id: `stats-${Date.now()}`,
          builtInId: id,
          likeCount: 0,
          usageCount: 1,
          updatedAt: Date.now()
        });
      }
      saveUserPersonas(personas);
      const stats = personas.find(p => p.builtInId === id);
      return res.json({ success: true, data: { id, usageCount: stats?.usageCount || 0 } });
    }

    return res.status(404).json({ success: false, error: 'Persona not found' });
  } catch (error) {
    console.error('Error incrementing usage:', error);
    res.status(500).json({ success: false, error: 'Failed to increment usage' });
  }
});

/**
 * POST /api/personas/rewrite
 * Rewrite and enrich a persona with LLM (auto-triggered before save)
 */
router.post('/rewrite', async (req, res) => {
  try {
    const { name, coreView, speakingStyle, actionStyle, background } = req.body;

    if (!name || !coreView || !speakingStyle || !actionStyle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, coreView, speakingStyle, actionStyle'
      });
    }

    const { avatar } = req.body;

    const rewritten = await rewritePersona({
      name,
      coreView,
      speakingStyle,
      actionStyle,
      background
    });

    res.json({
      success: true,
      data: { ...rewritten, avatar }
    });
  } catch (error) {
    console.error('Error rewriting persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rewrite persona'
    });
  }
});

/**
 * DELETE /api/personas/:id
 * Delete a user persona
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const personas = loadUserPersonas();
    const filtered = personas.filter(p => p.id !== id);

    if (filtered.length === personas.length) {
      return res.status(404).json({
        success: false,
        error: 'Persona not found'
      });
    }

    saveUserPersonas(filtered);

    res.json({
      success: true,
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete persona'
    });
  }
});

/**
 * POST /api/personas/generate
 * Generate a new persona based on input parameters (AI-assisted)
 */
router.post('/generate', async (req, res) => {
  try {
    const { name, personality, speakingStyle, views, background } = req.body;

    // 验证必填字段
    if (!name || !speakingStyle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, speakingStyle'
      });
    }

    const persona = await generatePersona({
      name,
      personality: personality || [],
      speakingStyle,
      views: views || [],
      background
    });

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate persona'
    });
  }
});

export default router;

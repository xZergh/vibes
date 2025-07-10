const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { pool } = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @swagger
 * /api/comments/{slug}:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieves all approved comments for a specific blog post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the blog post
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   username:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const result = await pool.query(`
      SELECT c.id, c.content, c.created_at, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_slug = $1 AND c.is_approved = true
      ORDER BY c.created_at DESC
    `, [slug]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Add a comment
 *     description: Creates a new comment for a blog post (requires authentication)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - post_slug
 *               - content
 *             properties:
 *               post_slug:
 *                 type: string
 *                 description: The slug of the blog post
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 content:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', [
  auth,
  check('post_slug', 'Post slug is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { post_slug, content } = req.body;
  const user_id = req.user.id;

  try {
    const newComment = await pool.query(`
      INSERT INTO comments (post_slug, user_id, content, is_approved)
      VALUES ($1, $2, $3, true)
      RETURNING id, content, created_at
    `, [post_slug, user_id, content]);

    res.json(newComment.rows[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Deletes a comment (user must be the author or an admin)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    // Check if comment exists and belongs to user
    const commentCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1',
      [id]
    );
    
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the owner or an admin
    if (commentCheck.rows[0].user_id !== user_id && !req.user.is_admin) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Delete comment
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/comments/admin/pending:
 *   get:
 *     summary: Get pending comments
 *     description: Retrieves all comments pending approval (admin only)
 *     tags: [Comments, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   post_slug:
 *                     type: string
 *                   username:
 *                     type: string
 *       401:
 *         description: Not authenticated or not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/admin/pending', [auth, admin], async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.content, c.created_at, c.post_slug, u.username 
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_approved = false
      ORDER BY c.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending comments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/comments/admin/approve/{id}:
 *   put:
 *     summary: Approve a comment
 *     description: Approves a pending comment (admin only)
 *     tags: [Comments, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the comment to approve
 *     responses:
 *       200:
 *         description: Comment approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated or not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/admin/approve/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if comment exists
    const commentCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1',
      [id]
    );
    
    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Approve comment
    await pool.query(
      'UPDATE comments SET is_approved = true WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Comment approved successfully' });
  } catch (err) {
    console.error('Error approving comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
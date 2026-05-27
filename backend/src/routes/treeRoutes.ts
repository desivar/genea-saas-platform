import { Router, Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware.js';
import { Tree } from '../models/Tree.js';
import { FamilyMember } from '../models/FamilyMember.js';

const router = Router();

// All tree routes are protected
router.use(protect);

// @route   GET /api/trees
// @desc    Get all trees for logged in user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trees = await Tree.find({ ownerId: req.user!.id }).sort({ updatedAt: -1 });
    res.json(trees);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   POST /api/trees
// @desc    Create a new family tree
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    const tree = new Tree({
      title: title || 'New Family Tree',
      description,
      ownerId: req.user!.id,
      ownerName: req.body.ownerName,
      isPublic: false,
      memberCount: 0,
      generationCount: 0,
    });

    await tree.save();
    res.status(201).json(tree);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   GET /api/trees/:id
// @desc    Get a single tree by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tree = await Tree.findOne({
      _id: req.params.id,
      ownerId: req.user!.id
    });

    if (!tree) {
      res.status(404).json({ message: 'Tree not found.' });
      return;
    }

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   PUT /api/trees/:id
// @desc    Update a tree (title, description, nodePositions)
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, isPublic, nodePositions } = req.body;

    const tree = await Tree.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.id },
      { title, description, isPublic, nodePositions },
      { new: true }
    );

    if (!tree) {
      res.status(404).json({ message: 'Tree not found.' });
      return;
    }

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   DELETE /api/trees/:id
// @desc    Delete a tree and all its members
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tree = await Tree.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user!.id
    });

    if (!tree) {
      res.status(404).json({ message: 'Tree not found.' });
      return;
    }

    // Delete all members belonging to this tree
    await FamilyMember.deleteMany({ treeId: req.params.id });

    res.json({ message: 'Tree deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   GET /api/trees/:id/members
// @desc    Get all members of a tree
router.get('/:id/members', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const members = await FamilyMember.find({ treeId: req.params.id })
      .sort({ generation: 1, lastName: 1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   POST /api/trees/:id/members
// @desc    Add a new member to a tree
router.post('/:id/members', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      firstName, lastName, gender,
      birthDate, birthPlace,
      deathDate, deathPlace,
      generation, heritage,
      fatherId, motherId,
      spouseIds, childrenIds,
      notes, profilePhoto
    } = req.body;

    const member = new FamilyMember({
      firstName,
      lastName,
      gender,
      birthDate,
      birthPlace,
      deathDate,
      deathPlace,
      generation,
      heritage,
      fatherId,
      motherId,
      spouseIds,
      childrenIds,
      notes,
      profilePhoto,
      treeId: req.params.id,
      citations: []
    });

    await member.save();

    // Update member count on the tree
    await Tree.findByIdAndUpdate(req.params.id, {
      $inc: { memberCount: 1 },
      $max: { generationCount: generation || 1 }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   PUT /api/trees/:id/members/:memberId
// @desc    Update a family member
router.put('/:id/members/:memberId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.memberId, treeId: req.params.id },
      req.body,
      { new: true }
    );

    if (!member) {
      res.status(404).json({ message: 'Member not found.' });
      return;
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   DELETE /api/trees/:id/members/:memberId
// @desc    Remove a member from a tree
router.delete('/:id/members/:memberId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await FamilyMember.findOneAndDelete({
      _id: req.params.memberId,
      treeId: req.params.id
    });

    if (!member) {
      res.status(404).json({ message: 'Member not found.' });
      return;
    }

    // Update member count
    await Tree.findByIdAndUpdate(req.params.id, {
      $inc: { memberCount: -1 }
    });

    res.json({ message: 'Member removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// @route   GET /api/trees/public/:id
// @desc    Get a public tree (no auth required)
router.get('/public/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tree = await Tree.findOne({ _id: req.params.id, isPublic: true });

    if (!tree) {
      res.status(404).json({ message: 'Tree not found or is private.' });
      return;
    }

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
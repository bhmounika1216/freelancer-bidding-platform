const Bid = require('../models/Bid');
const Project = require('../models/Project');

// GET all bids placed by the logged-in freelancer
const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user.id }).sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all bids for a specific project (only project owner can view)
const getBidsForProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check authorization
    if (String(project.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view bids for this project' });
    }

    const bids = await Bid.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create a new bid
const addBid = async (req, res) => {
  const { projectId, amount, coverLetter } = req.body;
  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Bidding is closed for this project' });
    }

    const bid = await Bid.create({
      projectId,
      bidderId: req.user.id,
      amount,
      coverLetter
    });

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update a bid (only by the freelancer who created it)
const updateBid = async (req, res) => {
  const { amount, coverLetter } = req.body;
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    if (String(bid.bidderId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this bid' });
    }

    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bids can be updated' });
    }

    bid.amount = amount ?? bid.amount;
    bid.coverLetter = coverLetter ?? bid.coverLetter;

    const updated = await bid.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a bid (only by the freelancer who created it)
const deleteBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) return res.status(404).json({ message: 'Bid not found' });

    if (String(bid.bidderId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this bid' });
    }

    await bid.deleteOne();
    res.json({ message: 'Bid deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyBids,
  getBidsForProject,
  addBid,
  updateBid,
  deleteBid
};

const Project = require('../models/project');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(projects); // explicitly set status
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET single project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project); // explicitly set 200
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create new project
const addProject = async (req, res) => {
  const { title, description, skills, budgetMin, budgetMax, deadline } = req.body;
  try {
    const project = await Project.create({
      userId: req.user.id,
      title,
      description,
      skills,
      budgetMin,
      budgetMax,
      deadline
    });
    res.status(201).json(project); // 201 for creation
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update project by ID
const updateProject = async (req, res) => {
  const { title, description, skills, budgetMin, budgetMax, status, deadline } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // check if owner
    if (String(project.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.skills = skills ?? project.skills;
    project.budgetMin = budgetMin ?? project.budgetMin;
    project.budgetMax = budgetMax ?? project.budgetMax;
    project.status = status ?? project.status;
    project.deadline = deadline ?? project.deadline;

    const updated = await project.save();
    res.status(200).json(updated); // explicitly set 200
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE project by ID
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // check if owner
    if (String(project.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.status(200).json({ message: 'Project deleted' }); // explicitly set 200
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
};

const sinon = require('sinon');
const { expect } = require('chai');
const Project = require('../models/project');
const {
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

describe('Project Controller Tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // ------------------- AddProject Tests -------------------
  describe('AddProject Function Test', () => {
    it('should create a new project successfully', async () => {
      const req = { body: { title: 'Test Project', description: 'Desc' }, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'create').resolves({ _id: '1', ...req.body });

      await addProject(req, res);

      sinon.assert.calledOnce(Project.create);
      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledWith(res.json, sinon.match({ _id: '1', title: 'Test Project' }));
    });

    it('should return 500 if an error occurs', async () => {
      const req = { body: {}, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'create').throws(new Error('DB error'));

      await addProject(req, res);

      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'DB error' }));
    });
  });

  // ------------------- UpdateProject Tests -------------------
  describe('UpdateProject Function Test', () => {
    it('should update project successfully', async () => {
      const req = { params: { id: '1' }, body: { title: 'Updated Project' }, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      const mockProject = {
        _id: '1',
        userId: 'user123',
        title: 'Old Project',
        save: sandbox.stub().resolvesThis()
      };
      sandbox.stub(Project, 'findById').resolves(mockProject);

      await updateProject(req, res);

      sinon.assert.calledOnce(Project.findById);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, sinon.match({ title: 'Updated Project' }));
    });

    it('should return 404 if project not found', async () => {
      const req = { params: { id: '2' }, body: {}, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'findById').resolves(null);

      await updateProject(req, res);

      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'Project not found' }));
    });

    it('should return 500 on error', async () => {
      const req = { params: { id: '3' }, body: {}, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'findById').throws(new Error('DB error'));

      await updateProject(req, res);

      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'DB error' }));
    });
  });

  // ------------------- GetProjects Tests -------------------
  describe('GetProjects Function Test', () => {
    it('should return projects for the given user', async () => {
      const req = { user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'find').returns({
        sort: sandbox.stub().resolves([{ _id: '1', title: 'Project 1' }])
      });

      await getProjects(req, res);

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, sinon.match.array);
    });

    it('should return 500 on error', async () => {
      const req = { user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'find').throws(new Error('DB error'));

      await getProjects(req, res);

      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'DB error' }));
    });
  });

  // ------------------- DeleteProject Tests -------------------
  describe('DeleteProject Function Test', () => {
    it('should delete a project successfully', async () => {
      const req = { params: { id: '1' }, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      const mockProject = {
        _id: '1',
        userId: 'user123',
        deleteOne: sandbox.stub().resolvesThis()
      };
      sandbox.stub(Project, 'findById').resolves(mockProject);

      await deleteProject(req, res);

      sinon.assert.calledOnce(Project.findById);
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'Project deleted' }));
    });

    it('should return 404 if project not found', async () => {
      const req = { params: { id: '2' }, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'findById').resolves(null);

      await deleteProject(req, res);

      sinon.assert.calledWith(res.status, 404);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'Project not found' }));
    });

    it('should return 500 if an error occurs', async () => {
      const req = { params: { id: '3' }, user: { id: 'user123' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.stub() };

      sandbox.stub(Project, 'findById').throws(new Error('DB error'));

      await deleteProject(req, res);

      sinon.assert.calledWith(res.status, 500);
      sinon.assert.calledWith(res.json, sinon.match({ message: 'DB error' }));
    });
  });
});

const { ToolRequest, Project, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getAllToolRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, priority, project_id, request_type } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (project_id) where.project_id = project_id;
    if (request_type) where.request_type = request_type;

    // Role-based filtering
    if (req.user.role === 'supervisor') {
      where.requested_by = req.user.id;
    }

    const requests = await ToolRequest.findAndCountAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'username'], required: false }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requests.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: requests.count,
        pages: Math.ceil(requests.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createToolRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const requestData = {
      ...req.body,
      requested_by: req.user.id
    };

    const request = await ToolRequest.create(requestData);
    
    res.status(201).json({
      success: true,
      message: 'Tool request created successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const getToolRequestById = async (req, res, next) => {
  try {
    const request = await ToolRequest.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'username'], required: false }
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Tool request not found' });
    }

    // Check permissions
    if (req.user.role === 'supervisor' && request.requested_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

const updateToolRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const request = await ToolRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Tool request not found' });
    }

    // Check permissions
    if (req.user.role === 'supervisor' && request.requested_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request' });
    }

    // Only allow updates if status is Pending
    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot update request after review' });
    }

    await request.update(req.body);
    
    res.json({
      success: true,
      message: 'Tool request updated successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const approveToolRequest = async (req, res, next) => {
  try {
    const { comments, supplier_info } = req.body;
    
    const request = await ToolRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Tool request not found' });
    }

    // Only admin can approve
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to approve requests' });
    }

    await request.update({
      status: 'Approved',
      reviewed_by: req.user.id,
      reviewed_date: new Date(),
      review_comments: comments,
      supplier_info
    });
    
    res.json({
      success: true,
      message: 'Tool request approved successfully',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const rejectToolRequest = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    const request = await ToolRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Tool request not found' });
    }

    // Only admin can reject
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject requests' });
    }

    await request.update({
      status: 'Rejected',
      reviewed_by: req.user.id,
      reviewed_date: new Date(),
      review_comments: comments
    });
    
    res.json({
      success: true,
      message: 'Tool request rejected',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const markAsReturned = async (req, res, next) => {
  try {
    const { return_condition, comments } = req.body;
    
    const request = await ToolRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Tool request not found' });
    }

    if (request.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Can only mark delivered tools as returned' });
    }

    await request.update({
      status: 'Returned',
      returned_date: new Date(),
      return_condition,
      review_comments: comments
    });
    
    res.json({
      success: true,
      message: 'Tool request marked as returned',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

const getToolRequestsByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    
    const requests = await ToolRequest.findAll({
      where: { project_id },
      include: [
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'reviewedBy', attributes: ['id', 'name', 'username'], required: false }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllToolRequests,
  createToolRequest,
  getToolRequestById,
  updateToolRequest,
  approveToolRequest,
  rejectToolRequest,
  markAsReturned,
  getToolRequestsByProject
};

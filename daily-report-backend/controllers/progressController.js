const { WorkProgress, Project, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getAllProgressReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, project_id, date, approved } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (project_id) where.project_id = project_id;
    if (date) where.report_date = date;
    if (approved !== undefined) where.is_approved = approved === 'true';

    const reports = await WorkProgress.findAndCountAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'username'], required: false }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['report_date', 'DESC']]
    });

    res.json({
      success: true,
      data: reports.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reports.count,
        pages: Math.ceil(reports.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createProgressReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if report already exists for this project, date, and shift
    const existingReport = await WorkProgress.findOne({
      where: {
        project_id: req.body.project_id,
        report_date: req.body.report_date,
        shift: req.body.shift || 'Full Day'
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Progress report already exists for this project, date, and shift'
      });
    }

    const reportData = {
      ...req.body,
      submitted_by: req.user.id
    };

    const report = await WorkProgress.create(reportData);
    
    res.status(201).json({
      success: true,
      message: 'Progress report submitted successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const getProgressReportById = async (req, res, next) => {
  try {
    const report = await WorkProgress.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project' },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'username'], required: false }
      ]
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

const updateProgressReport = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const report = await WorkProgress.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    // Check permissions
    if (req.user.role === 'supervisor' && report.submitted_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Can't update if already approved
    if (report.is_approved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update approved report'
      });
    }

    await report.update(req.body);
    
    res.json({
      success: true,
      message: 'Progress report updated successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const approveProgressReport = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    const report = await WorkProgress.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    // Only admin can approve
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve reports'
      });
    }

    await report.update({
      is_approved: true,
      approved_by: req.user.id,
      approved_date: new Date(),
      approval_comments: comments
    });

    res.json({
      success: true,
      message: 'Progress report approved successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const getProgressReportsByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let where = { project_id };
    
    if (start_date && end_date) {
      where.report_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const reports = await WorkProgress.findAll({
      where,
      include: [
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'username'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'username'], required: false }
      ],
      order: [['report_date', 'DESC']]
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

const getProgressReportsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    
    const reports = await WorkProgress.findAll({
      where: { report_date: date },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] },
        { model: User, as: 'submittedBy', attributes: ['id', 'name', 'username'] }
      ],
      order: [['project_id']]
    });

    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProgressReports,
  createProgressReport,
  getProgressReportById,
  updateProgressReport,
  approveProgressReport,
  getProgressReportsByProject,
  getProgressReportsByDate
};

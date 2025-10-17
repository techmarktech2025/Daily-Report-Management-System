const { Attendance, Employee, Project, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const moment = require('moment');

const getAllAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, project_id, employee_id, date, status } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (project_id) where.project_id = project_id;
    if (employee_id) where.employee_id = employee_id;
    if (date) where.attendance_date = date;
    if (status) where.status = status;

    const attendance = await Attendance.findAndCountAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'personal_info'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['attendance_date', 'DESC'], ['check_in_time', 'ASC']]
    });

    res.json({
      success: true,
      data: attendance.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: attendance.count,
        pages: Math.ceil(attendance.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const { employee_id, project_id, location, work_description } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      where: { employee_id, attendance_date: today }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const attendance = await Attendance.create({
      employee_id,
      project_id,
      attendance_date: today,
      check_in_time: currentTime,
      check_in_location: location,
      status: 'Present',
      work_description
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { employee_id, location, work_description } = req.body;
    const today = moment().format('YYYY-MM-DD');
    const currentTime = moment().format('HH:mm:ss');

    const attendance = await Attendance.findOne({
      where: { employee_id, attendance_date: today }
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    // Calculate total hours
    const checkInTime = moment(`${today} ${attendance.check_in_time}`);
    const checkOutTime = moment(`${today} ${currentTime}`);
    const totalHours = checkOutTime.diff(checkInTime, 'hours', true);

    await attendance.update({
      check_out_time: currentTime,
      check_out_location: location,
      total_hours: totalHours.toFixed(2),
      work_description: work_description || attendance.work_description
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByPk(req.params.id, {
      include: [
        { model: Employee, as: 'employee' },
        { model: Project, as: 'project' }
      ]
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const approveAttendance = async (req, res, next) => {
  try {
    const { comments } = req.body;
    
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.update({
      is_approved: true,
      approved_by: req.user.id,
      approved_date: new Date(),
      comments
    });

    res.json({
      success: true,
      message: 'Attendance approved successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

const getTodaysAttendance = async (req, res, next) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    
    const attendance = await Attendance.findAll({
      where: { attendance_date: today },
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'personal_info'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] }
      ],
      order: [['check_in_time', 'ASC']]
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let where = { employee_id };
    
    if (start_date && end_date) {
      where.attendance_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] }],
      order: [['attendance_date', 'DESC']]
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const { start_date, end_date } = req.query;
    
    let where = { project_id };
    
    if (start_date && end_date) {
      where.attendance_date = {
        [Op.between]: [start_date, end_date]
      };
    }

    const attendance = await Attendance.findAll({
      where,
      include: [{ model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'personal_info'] }],
      order: [['attendance_date', 'DESC']]
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAttendance,
  checkIn,
  checkOut,
  getAttendanceById,
  approveAttendance,
  getTodaysAttendance,
  getAttendanceByEmployee,
  getAttendanceByProject
};

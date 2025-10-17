const { Employee, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const getAllEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department, search, active_only = 'true' } = req.query;
    const offset = (page - 1) * limit;
    
    let where = {};
    if (active_only === 'true') where.is_active = true;
    
    if (search) {
      where[Op.or] = [
        { employee_id: { [Op.like]: `%${search}%` } },
        { '$personal_info.first_name$': { [Op.like]: `%${search}%` } },
        { '$personal_info.last_name$': { [Op.like]: `%${search}%` } },
        { '$employment.department$': { [Op.like]: `%${search}%` } }
      ];
    }

    if (department) {
      where['$employment.department$'] = department;
    }

    const employees = await Employee.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: employees.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: employees.count,
        pages: Math.ceil(employees.count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employeeData = {
      ...req.body,
      created_by: req.user.id
    };

    const employee = await Employee.create(employeeData);
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.update(req.body);
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await employee.update({ is_active: false, termination_date: new Date() });
    
    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getActiveEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.findAll({
      where: { is_active: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }],
      order: [['personal_info', 'first_name']]
    });

    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

const getEmployeesByDepartment = async (req, res, next) => {
  try {
    const { department } = req.params;
    
    const employees = await Employee.findAll({
      where: {
        is_active: true,
        '$employment.department$': department
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getActiveEmployees,
  getEmployeesByDepartment
};

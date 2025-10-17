const { Project, User, Employee, MaterialRequest, ToolRequest, Attendance, WorkProgress } = require('../models');
const { Op, fn, col } = require('sequelize');
const moment = require('moment');

const getDashboardStats = async (req, res, next) => {
  try {
    // Get basic counts
    const [
      totalProjects,
      activeProjects,
      totalEmployees,
      activeEmployees,
      pendingMaterialRequests,
      pendingToolRequests,
      todayAttendance,
      pendingProgressReports
    ] = await Promise.all([
      Project.count({ where: { is_active: true } }),
      Project.count({ where: { status: 'Active', is_active: true } }),
      Employee.count(),
      Employee.count({ where: { is_active: true } }),
      MaterialRequest.count({ where: { status: 'Pending' } }),
      ToolRequest.count({ where: { status: 'Pending' } }),
      Attendance.count({ where: { attendance_date: moment().format('YYYY-MM-DD') } }),
      WorkProgress.count({ where: { is_approved: false } })
    ]);

    // Get project status distribution
    const projectsByStatus = await Project.findAll({
      where: { is_active: true },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    // Get recent activities (last 7 days)
    const recentMaterialRequests = await MaterialRequest.count({
      where: {
        created_at: {
          [Op.gte]: moment().subtract(7, 'days').toDate()
        }
      }
    });

    const recentToolRequests = await ToolRequest.count({
      where: {
        created_at: {
          [Op.gte]: moment().subtract(7, 'days').toDate()
        }
      }
    });

    const stats = {
      overview: {
        totalProjects,
        activeProjects,
        totalEmployees,
        activeEmployees,
        pendingMaterialRequests,
        pendingToolRequests,
        todayAttendance,
        pendingProgressReports
      },
      projectsByStatus: projectsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {}),
      recentActivity: {
        materialRequests: recentMaterialRequests,
        toolRequests: recentToolRequests
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getProjectReports = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    let where = { is_active: true };
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get additional stats for each project
    const projectReports = await Promise.all(
      projects.map(async (project) => {
        const [materialRequests, toolRequests, progressReports, attendanceCount] = await Promise.all([
          MaterialRequest.count({ where: { project_id: project.id } }),
          ToolRequest.count({ where: { project_id: project.id } }),
          WorkProgress.count({ where: { project_id: project.id } }),
          Attendance.count({ where: { project_id: project.id } })
        ]);

        return {
          ...project.toJSON(),
          stats: {
            materialRequests,
            toolRequests,
            progressReports,
            attendanceCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: projectReports
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeReports = async (req, res, next) => {
  try {
    const { start_date, end_date, department } = req.query;
    let where = { is_active: true };
    
    if (department) {
      where['$employment.department$'] = department;
    }

    const employees = await Employee.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    // Get attendance stats for each employee
    const employeeReports = await Promise.all(
      employees.map(async (employee) => {
        let attendanceWhere = { employee_id: employee.id };
        
        if (start_date && end_date) {
          attendanceWhere.attendance_date = {
            [Op.between]: [start_date, end_date]
          };
        }

        const [totalDays, presentDays, lateDays] = await Promise.all([
          Attendance.count({ where: attendanceWhere }),
          Attendance.count({ where: { ...attendanceWhere, status: 'Present' } }),
          Attendance.count({ where: { ...attendanceWhere, status: 'Late' } })
        ]);

        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        return {
          ...employee.toJSON(),
          attendanceStats: {
            totalDays,
            presentDays,
            lateDays,
            attendancePercentage
          }
        };
      })
    );

    res.json({
      success: true,
      data: employeeReports
    });
  } catch (error) {
    next(error);
  }
};

const getMaterialReports = async (req, res, next) => {
  try {
    const { start_date, end_date, project_id, status } = req.query;
    let where = {};
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    if (project_id) where.project_id = project_id;
    if (status) where.status = status;

    const materialRequests = await MaterialRequest.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] },
        { model: User, as: 'requestedBy', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // Get summary stats
    const statusCounts = await MaterialRequest.findAll({
      where,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('total_estimated_cost')), 'totalCost']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        requests: materialRequests,
        summary: statusCounts.reduce((acc, item) => {
          acc[item.status] = {
            count: parseInt(item.dataValues.count),
            totalCost: parseFloat(item.dataValues.totalCost) || 0
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAttendanceReports = async (req, res, next) => {
  try {
    const { start_date, end_date, project_id, employee_id } = req.query;
    let where = {};
    
    if (start_date && end_date) {
      where.attendance_date = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    if (project_id) where.project_id = project_id;
    if (employee_id) where.employee_id = employee_id;

    const attendance = await Attendance.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'employee_id', 'personal_info'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'project_id'] }
      ],
      order: [['attendance_date', 'DESC']]
    });

    // Get summary stats
    const summaryStats = await Attendance.findAll({
      where,
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('total_hours')), 'avgHours']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        attendance,
        summary: summaryStats.reduce((acc, item) => {
          acc[item.status] = {
            count: parseInt(item.dataValues.count),
            avgHours: parseFloat(item.dataValues.avgHours) || 0
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getProjectReports,
  getEmployeeReports,
  getMaterialReports,
  getAttendanceReports
};

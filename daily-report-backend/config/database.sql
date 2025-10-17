-- Daily Report Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS daily_report_system;
USE daily_report_system;

-- Users table (already created, but here's the complete structure)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('superadmin', 'admin', 'supervisor') DEFAULT 'supervisor',
    employee_id VARCHAR(20) UNIQUE,
    phone VARCHAR(15),
    avatar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    location JSON NOT NULL,
    client JSON NOT NULL,
    status ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_budget DECIMAL(15,2),
    actual_cost DECIMAL(15,2) DEFAULT 0,
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    scope_of_work JSON,
    project_documents JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_project_status (status),
    INDEX idx_project_dates (start_date, end_date),
    INDEX idx_project_created_by (created_by)
);

-- Employees table (enhanced structure)
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    personal_info JSON NOT NULL,
    employment JSON NOT NULL,
    skills JSON,
    qualifications JSON,
    emergency_contact JSON,
    is_active BOOLEAN DEFAULT TRUE,
    termination_date DATE,
    termination_reason TEXT,
    performance_rating DECIMAL(2,1) CHECK (performance_rating >= 1.0 AND performance_rating <= 5.0),
    last_review_date DATE,
    user_id INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_employee_active (is_active),
    INDEX idx_employee_user (user_id)
);

-- Project Assignments table
CREATE TABLE IF NOT EXISTS project_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    employee_id INT NOT NULL,
    supervisor_id INT,
    role ENUM('supervisor', 'worker', 'specialist', 'manager') DEFAULT 'worker',
    assignment_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    responsibilities JSON,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_active_assignment (project_id, employee_id, is_active),
    INDEX idx_assignment_project (project_id),
    INDEX idx_assignment_employee (employee_id),
    INDEX idx_assignment_supervisor (supervisor_id)
);

-- Enhanced Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    check_in_location JSON,
    check_out_location JSON,
    total_hours DECIMAL(4,2),
    break_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status ENUM('Present', 'Absent', 'Half Day', 'Late', 'Holiday', 'Leave') DEFAULT 'Present',
    work_description TEXT,
    photos JSON,
    weather_conditions VARCHAR(100),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_date DATETIME,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_daily_attendance (employee_id, attendance_date),
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_project (project_id),
    INDEX idx_attendance_status (status)
);

-- Enhanced Material Requests table
CREATE TABLE IF NOT EXISTS material_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    project_id INT NOT NULL,
    materials JSON NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Partially Approved', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    required_date DATE NOT NULL,
    reason TEXT NOT NULL,
    reviewed_date DATETIME,
    review_comments TEXT,
    approved_quantities JSON,
    delivery_status ENUM('Not Delivered', 'Partially Delivered', 'Fully Delivered') DEFAULT 'Not Delivered',
    delivered_date DATE,
    delivered_by VARCHAR(100),
    delivery_notes TEXT,
    total_estimated_cost DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    supplier_info JSON,
    attachments JSON,
    requested_by INT NOT NULL,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_material_request_status (status),
    INDEX idx_material_request_project (project_id),
    INDEX idx_material_request_date (required_date)
);

-- Enhanced Tool Requests table
CREATE TABLE IF NOT EXISTS tool_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    project_id INT NOT NULL,
    tools JSON NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Delivered', 'Returned', 'Cancelled') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    request_type ENUM('Purchase', 'Rent', 'Borrow') DEFAULT 'Purchase',
    required_date DATE NOT NULL,
    return_date DATE,
    reason TEXT NOT NULL,
    reviewed_date DATETIME,
    review_comments TEXT,
    delivered_date DATE,
    delivered_by VARCHAR(100),
    returned_date DATE,
    return_condition TEXT,
    total_estimated_cost DECIMAL(15,2) DEFAULT 0,
    actual_cost DECIMAL(15,2) DEFAULT 0,
    supplier_info JSON,
    attachments JSON,
    requested_by INT NOT NULL,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tool_request_status (status),
    INDEX idx_tool_request_project (project_id),
    INDEX idx_tool_request_date (required_date)
);

-- Enhanced Work Progress table
CREATE TABLE IF NOT EXISTS work_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(20) UNIQUE NOT NULL,
    project_id INT NOT NULL,
    report_date DATE NOT NULL,
    shift ENUM('Morning', 'Evening', 'Night', 'Full Day') DEFAULT 'Full Day',
    weather_conditions VARCHAR(100),
    tasks_completed JSON,
    tasks_in_progress JSON,
    tasks_planned JSON,
    materials_used JSON,
    tools_used JSON,
    manpower JSON,
    safety_incidents JSON,
    quality_checks JSON,
    challenges_faced TEXT,
    solutions_implemented TEXT,
    next_day_plan TEXT,
    photos JSON,
    documents JSON,
    overall_progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (overall_progress_percentage >= 0 AND overall_progress_percentage <= 100),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_date DATETIME,
    approval_comments TEXT,
    submitted_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_daily_report (project_id, report_date, shift),
    INDEX idx_progress_date (report_date),
    INDEX idx_progress_project (project_id),
    INDEX idx_progress_approved (is_approved)
);

-- Additional utility tables

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    sender_id INT,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notification_recipient (recipient_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_at)
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_user (user_id),
    INDEX idx_log_action (action),
    INDEX idx_log_created (created_at)
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    uploaded_by INT NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_upload_entity (entity_type, entity_id),
    INDEX idx_upload_user (uploaded_by)
);

-- Insert default data
INSERT IGNORE INTO users (username, email, password, name, role, employee_id, permissions) VALUES
('superadmin', 'superadmin@techmark.tech', '$2b$12$9xOYvx9zEUL8ZWKmCWFKYeKyFgzVjUOkWK.8dWPnS9.WPvVKPsKnK', 'Super Administrator', 'superadmin', 'SA001', 
 '["all_projects", "user_management", "system_config", "analytics", "reports", "employee_management", "financial_reports"]'),

('admin', 'admin@company.com', '$2b$12$9xOYvx9zEUL8ZWKmCWFKYeKyFgzVjUOkWK.8dWPnS9.WPvVKPsKnK', 'Admin User', 'admin', 'AD001', 
 '["project_management", "employee_management", "material_approval", "tool_approval", "attendance_management", "progress_reports"]'),

('supervisor1', 'supervisor1@company.com', '$2b$12$9xOYvx9zEUL8ZWKmCWFKYeKyFgzVjUOkWK.8dWPnS9.WPvVKPsKnK', 'Rajesh Kumar', 'supervisor', 'SUP001', 
 '["attendance_entry", "material_request", "tool_request", "progress_report", "employee_view"]'),

('supervisor2', 'supervisor2@company.com', '$2b$12$9xOYvx9zEUL8ZWKmCWFKYeKyFgzVjUOkWK.8dWPnS9.WPvVKPsKnK', 'Priya Sharma', 'supervisor', 'SUP002', 
 '["attendance_entry", "material_request", "tool_request", "progress_report", "employee_view"]');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

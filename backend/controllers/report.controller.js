const { validationResult } = require('express-validator');
const Report = require('../models/report.model');
const Property = require('../models/property.model');

exports.createReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, title, description, type } = req.body;
    const created_by = req.user.id;

    // Get and check property information
    const property = await Property.findById(property_id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create new report
    const reportId = await Report.create({
      property_id,
      created_by,
      title,
      description,
      type
    });

    // Get report information
    const report = await Report.findById(reportId);

    res.status(201).json({
      message: 'Report created successfully',
      id: reportId,
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // Get all reports belonging to the user
    const reports = await Report.findByUserId(req.user.id);

    res.json(reports);
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    
    // Different users with reports for the same property can see each other's reports
    // This allows landlords and tenants to see each other's reports
    const property = await Property.findById(report.property_id);
    const hasPropertyAccess = property.user_id === req.user.id;
    
    if (!isOwner && !hasPropertyAccess) {
      return res.status(403).json({ message: 'You do not have permission to access this report' });
    }

    // Log report view
    await Report.logReportView(reportId, req.user.id);

    res.json(report);
  } catch (error) {
    console.error('Get report by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportByUuid = async (req, res) => {
  try {
    const uuid = req.params.uuid;

    // Get report information by UUID
    const report = await Report.findByUuid(uuid);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Any user can access reports via UUID
    // Log report view
    await Report.logReportView(report.id, req.user ? req.user.id : null);

    res.json(report);
  } catch (error) {
    console.error('Get report by uuid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportId = req.params.id;
    const { title, description, type } = req.body;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to edit this report' });
    }

    // Update report
    const updated = await Report.update(reportId, {
      title,
      description,
      type
    });

    if (!updated) {
      return res.status(400).json({ message: 'Report could not be updated' });
    }

    // Get updated report information
    const updatedReport = await Report.findById(reportId);

    res.json({
      message: 'Report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    // Get report information
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is the report owner
    const isOwner = report.created_by === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this report' });
    }

    // Delete report (cascade delete will also delete photos)
    const deleted = await Report.delete(reportId);

    if (!deleted) {
      return res.status(400).json({ message: 'Report could not be deleted' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReportsByProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user has access to this property
    // (User can be the property owner or have created a report for this property)
    const isPropertyOwner = property.user_id === req.user.id;
    
    // Get reports for the property
    const reports = await Report.findByPropertyId(propertyId);

    // If user is not the property owner, they should only see reports they created
    const filteredReports = isPropertyOwner 
      ? reports 
      : reports.filter(report => report.created_by === req.user.id);

    res.json(filteredReports);
  } catch (error) {
    console.error('Get reports by property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

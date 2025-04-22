const { validationResult } = require('express-validator');
const Property = require('../models/property.model');
const Report = require('../models/report.model');

exports.createProperty = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address, description, role_at_this_property } = req.body;
    const user_id = req.user.id;

    // Create new property
    const propertyId = await Property.create({
      user_id,
      address,
      description,
      role_at_this_property
    });

    // Get property information
    const property = await Property.findById(propertyId);

    res.status(201).json({
      message: 'Property created successfully',
      id: propertyId,
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProperties = async (req, res) => {
  try {
    // Get all properties belonging to the user
    const properties = await Property.findByUserId(req.user.id);

    res.json(properties);
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to access this property' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const propertyId = req.params.id;
    const { address, description, role_at_this_property } = req.body;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to edit this property' });
    }

    // Update property
    const updated = await Property.update(propertyId, {
      address,
      description,
      role_at_this_property
    });

    if (!updated) {
      return res.status(400).json({ message: 'Property could not be updated' });
    }

    // Get updated property information
    const updatedProperty = await Property.findById(propertyId);

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to delete this property' });
    }

    // Delete property (cascade delete will also delete reports and photos)
    const deleted = await Property.delete(propertyId);

    if (!deleted) {
      return res.status(400).json({ message: 'Property could not be deleted' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPropertyReports = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to access reports for this property' });
    }

    // Get reports for the property
    const reports = await Report.findByPropertyId(propertyId);

    res.json(reports);
  } catch (error) {
    console.error('Get property reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

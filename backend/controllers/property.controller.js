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

    const {
      address,
      description,
      unit_number, // Add unit_number field
      role_at_this_property,
      deposit_amount,
      move_in_date,
      contract_start_date,
      contract_end_date,
      lease_duration,
      lease_duration_type,
      bathrooms,
      living_rooms,
      kitchen_count,
      square_footage,
      year_built,
      parking_spaces
    } = req.body;

    const user_id = req.user.id;

    // Log full request body for debugging
    console.log('Creating property with data:', req.body);
    console.log('Unit number from request:', unit_number);

    // Create new property with all available fields
    const propertyId = await Property.create({
      user_id,
      address,
      description,
      unit_number, // Pass unit_number to the create method
      role_at_this_property,
      deposit_amount,
      move_in_date,
      contract_start_date,
      contract_end_date,
      lease_duration,
      lease_duration_type,
      bathrooms,
      living_rooms: living_rooms,
      kitchen_count,
      square_footage,
      year_built,
      parking_spaces
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
    
    // Debug property data
    console.log('Property data from DB:', property);
    
    // If unit_number is not set but property_type is numeric, use it as unit_number
    if (!property.unit_number && property.property_type && /^\d+$/.test(property.property_type)) {
      property.unit_number = property.property_type;
      property.property_type = 'apartment';
      
      console.log('Property type converted to unit_number:', property.unit_number);
      console.log('Property type set to default:', property.property_type);
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
    const {
      address,
      description,
      unit_number, // Add unit_number field
      role_at_this_property,
      deposit_amount,
      contract_start_date,
      contract_end_date,
      move_in_date,
      lease_duration,
      lease_duration_type,
      kitchen_count,
      additional_spaces,
      landlord_email,
      landlord_phone,
      bathrooms,
      living_rooms,
      square_footage,
      year_built,
      parking_spaces
    } = req.body;
    
    // Check for special update flags - add extra debugging
    console.log('REQUEST BODY contains _basic_property_update:', req.body._basic_property_update);
    console.log('typeof req.body._basic_property_update:', typeof req.body._basic_property_update);
    
    // Sometimes boolean true can be converted to string "true" during transmission
    // Let's handle both cases to be super careful
    const isBasicPropertyUpdate = 
      req.body._basic_property_update === true || 
      req.body._basic_property_update === 'true';
      
    const isPartialUpdate = req.body._partial_update === true;
    
    if (isBasicPropertyUpdate) {
      console.log('🔵 BASIC PROPERTY UPDATE DETECTED! Only updating address, description, unit_number:');
      console.log('- address:', address);
      console.log('- description:', description);
      console.log('- unit_number:', unit_number);
      console.log('This special update will preserve all lease details');
      // Force the flag to be a boolean true to ensure correct processing in model
      req.body._basic_property_update = true;
    } else if (isPartialUpdate) {
      console.log('PARTIAL UPDATE DETECTED! Only updating specific fields:');
      const fieldsToUpdate = req.body._partial_fields || [];
      console.log('Fields to update:', fieldsToUpdate);
      console.log('Values:', fieldsToUpdate.map(field => ({ field, value: req.body[field] })));
    } else {
      // Debug property data in detail for regular updates
      console.log('Full property update request received:');
      console.log('- Unit number:', unit_number);
      console.log('- Lease dates received:');
      console.log('  * contract_start_date:', contract_start_date);
      console.log('  * contract_end_date:', contract_end_date);
      console.log('  * move_in_date:', move_in_date);
      console.log('- Lease details:');
      console.log('  * deposit_amount:', deposit_amount);
      console.log('  * lease_duration:', lease_duration);
      console.log('  * lease_duration_type:', lease_duration_type);
    }

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

    // Handle different update approaches based on flags
    let updateData;
    let updated;
    
    if (isBasicPropertyUpdate) {
      console.log('🔵 TEMEL MÜLK GÜNCELLENİYOR! SADECE adres, açıklama ve birim no değişecek...');
      console.log('🔐 Kira detayları (lease details) ve diğer alanlar KORUNACAK!');
      
      // Mevcut mülk verilerini log'layalım - bunlar değişmeyecek
      console.log('---- KORUNAN KİRA DETAYLARI (DEĞİŞTİRİLMİYOR) ----');
      console.log('deposit_amount:', property.deposit_amount);
      console.log('contract_start_date:', property.contract_start_date);
      console.log('contract_end_date:', property.contract_end_date);
      console.log('move_in_date:', property.move_in_date);
      console.log('lease_duration:', property.lease_duration);
      console.log('lease_duration_type:', property.lease_duration_type);
      console.log('--------------------------------------------');
      
      // Temel güncelleme için sadece gerekli alanları içeren minimal bir obje oluştur
      // ve özel flag'i kesinlikle boolean true olarak ayarla
      const basicUpdateData = {
        address, 
        description, 
        unit_number,
        _basic_property_update: true  // Boolean true olarak zorla
      };
      
      // Detaylı debug bilgisi ekle
      console.log('MODELE GÖNDERİLEN VERİ:', JSON.stringify(basicUpdateData));
      console.log('Flag tipi:', typeof basicUpdateData._basic_property_update);
      console.log('⛔ Bu güncelleme işlemi aşağıdaki alanları DEĞİŞTİRMEZ:');
      console.log('- deposit_amount: (önceki veri korunacak)');
      console.log('- contract_start_date: (önceki veri korunacak)');
      console.log('- contract_end_date: (önceki veri korunacak)');
      console.log('- move_in_date: (önceki veri korunacak)');
      console.log('- lease_duration: (önceki veri korunacak)');
      console.log('- lease_duration_type: (önceki veri korunacak)');
      
      // The property model will handle this with a special SQL query
      // that ONLY updates these 3 fields
      updated = await Property.update(propertyId, basicUpdateData);
      
      console.log('Basic property update processed, ensuring lease details are preserved.');
    } else if (isPartialUpdate) {
      console.log('Processing partial update...');
      
      // Prepare an update object with ONLY the specified fields
      updateData = {};
      
      // Copy ONLY the specified fields from the request
      const fieldsToUpdate = req.body._partial_fields || [];
      fieldsToUpdate.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      
      // Add required fields for validation
      if (!updateData.role_at_this_property) {
        updateData.role_at_this_property = property.role_at_this_property || 'renter';
      }
      
      // IMPORTANT: For partial update, we need to perform a PATCH-like operation
      // Get the complete existing property first
      const existingProperty = await Property.findById(propertyId);
      
      // For debugging, show the existing lease details
      console.log('PARTIAL UPDATE - Existing lease details (to be preserved):');
      console.log('- contract_start_date:', existingProperty.contract_start_date);
      console.log('- contract_end_date:', existingProperty.contract_end_date);
      console.log('- deposit_amount:', existingProperty.deposit_amount);
      console.log('- lease_duration:', existingProperty.lease_duration);
      
      // Create a merged update object
      const mergedData = {
        // Start with all existing property data
        ...existingProperty,
        
        // Override only with the fields from the partial update
        ...updateData
      };
      
      console.log('Merged data for update (preserving existing values):', mergedData);
      
      // Update with the merged data
      updated = await Property.update(propertyId, mergedData);
    } else {
      // For complete updates, log the comparison
      console.log('*** LEASE DETAIL COMPARISON ***');
      console.log('Current property data from DB:');
      console.log('- contract_start_date:', property.contract_start_date);
      console.log('- contract_end_date:', property.contract_end_date);
      console.log('- move_in_date:', property.move_in_date);
      console.log('- lease_duration:', property.lease_duration);
      console.log('- lease_duration_type:', property.lease_duration_type);
      console.log('- deposit_amount:', property.deposit_amount);
      
      console.log('New data being sent:');
      console.log('- contract_start_date:', contract_start_date);
      console.log('- contract_end_date:', contract_end_date);
      console.log('- move_in_date:', move_in_date);
      console.log('- lease_duration:', lease_duration);
      console.log('- lease_duration_type:', lease_duration_type);
      console.log('- deposit_amount:', deposit_amount);

      // Update property with all possible fields
      updated = await Property.update(propertyId, {
        address,
        description,
        unit_number, // Add unit_number to update data
        role_at_this_property,
        deposit_amount,
        contract_start_date,
        contract_end_date,
        move_in_date,
        lease_duration,
        lease_duration_type,
        kitchen_count,
        additional_spaces,
        landlord_email,
        landlord_phone,
        bathrooms,
        living_rooms,
        square_footage,
        year_built,
        parking_spaces
      });
    }

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

exports.saveLandlordDetails = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { email, phone } = req.body;

    console.log('Received landlord details:', { email, phone, propertyId });

    // Simple validations - allow either email or phone to be provided
    // Trim both fields to check for empty strings
    const trimmedEmail = email ? email.trim() : '';
    const trimmedPhone = phone ? phone.trim() : '';
    
    console.log('Landlord details validation:', { 
      email: email, 
      phone: phone,
      trimmedEmail: trimmedEmail,
      trimmedPhone: trimmedPhone
    });
    
    if (!trimmedEmail && !trimmedPhone) {
      return res.status(400).json({ message: 'Either email or phone is required' });
    }

    // Email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Phone validation if provided (minimum length check)
    if (phone) {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length < 8) {
        return res.status(400).json({ message: 'Phone number must contain at least 8 digits' });
      }
    }

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You do not have permission to update this property' });
    }

    // Update landlord details
    const updated = await Property.updateLandlordDetails(propertyId, { email, phone });

    if (!updated) {
      return res.status(400).json({ message: 'Landlord details could not be updated' });
    }

    // Get updated property information
    const updatedProperty = await Property.findById(propertyId);

    console.log('Landlord details updated:', { 
      landlord_email: updatedProperty.landlord_email, 
      landlord_phone: updatedProperty.landlord_phone 
    });

    res.json({
      message: 'Landlord details updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update landlord details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Oda bilgilerini kaydetme
exports.saveRooms = async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Accept both wrapped and unwrapped room data formats
    let roomsData = req.body.rooms || req.body;

    console.log('SAVE ROOMS REQUEST RECEIVED');
    console.log('Property ID:', propertyId);
    console.log('Request body:', req.body);
    console.log('roomsData type:', typeof roomsData);
    console.log('roomsData value:', roomsData);

    // Validate
    if (!roomsData || !Array.isArray(roomsData)) {
      console.log('Invalid roomsData - not an array');
      return res.status(400).json({ message: 'Valid rooms data array is required' });
    }

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      console.log('User is not owner. Property user_id:', property.user_id, 'Request user id:', req.user.id);
      return res.status(403).json({ message: 'You do not have permission to update this property' });
    }

    // Process rooms for consistency
    const processedRooms = roomsData.map(room => {
      // Ensure each room has a roomId and required fields
      if (!room.roomId) {
        room.roomId = `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        console.log('Generated roomId for room without ID:', room.roomId);
      }

      // Normalize field names for consistency
      return {
        roomId: room.roomId,
        roomName: room.roomName || room.name || 'Unnamed Room',
        roomType: room.roomType || room.type || 'other',
        roomQuality: room.roomQuality || room.quality || null,
        roomIssueNotes: room.roomIssueNotes || room.issueNotes || [],
        photoCount: room.photoCount || 0,
        timestamp: room.timestamp || new Date().toISOString()
      };
    });

    // Save processed rooms
    console.log('Saving processed rooms data:', processedRooms);
    const updated = await Property.saveRooms(propertyId, processedRooms);

    if (!updated) {
      console.log('Failed to save room data');
      return res.status(400).json({ message: 'Room data could not be saved' });
    }

    // Get the saved rooms to return them with their final format
    const savedRooms = await Property.getRooms(propertyId);

    console.log('Room data saved successfully');
    res.json({
      message: 'Room data saved successfully',
      roomCount: processedRooms.length,
      rooms: savedRooms
    });
  } catch (error) {
    console.error('Save rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Oda silme
exports.deleteRoom = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const roomId = req.params.roomId;

    console.log('DELETE ROOM REQUEST RECEIVED');
    console.log('Property ID:', propertyId);
    console.log('Room ID:', roomId);

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      console.log('User is not owner. Property user_id:', property.user_id, 'Request user id:', req.user.id);
      return res.status(403).json({ message: 'You do not have permission to update this property' });
    }

    // Get current rooms
    const rooms = await Property.getRooms(propertyId);
    console.log('Current rooms:', rooms);

    // Filter out the room to delete
    const updatedRooms = rooms.filter(room => room.roomId !== roomId);
    console.log('Updated rooms after deletion:', updatedRooms);

    // Save updated rooms
    const updated = await Property.saveRooms(propertyId, updatedRooms);

    if (!updated) {
      console.log('Failed to delete room');
      return res.status(400).json({ message: 'Room could not be deleted' });
    }

    console.log('Room deleted successfully');
    res.json({
      message: 'Room deleted successfully',
      roomId: roomId
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Oda bilgilerini getirme
exports.getRooms = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const Photo = require('../models/photo.model');

    console.log('GET ROOMS REQUEST RECEIVED');
    console.log('Property ID:', propertyId);

    // Get property information
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is the owner
    const isOwner = property.user_id === req.user.id;
    if (!isOwner) {
      console.log('User is not owner. Property user_id:', property.user_id, 'Request user id:', req.user.id);
      return res.status(403).json({ message: 'You do not have permission to access this property' });
    }

    // Get rooms
    const rooms = await Property.getRooms(propertyId);
    console.log('Retrieved rooms from database:', rooms);

    // Create an array to store processed rooms
    const processedRooms = [];

    if (rooms && rooms.length > 0) {
      // Fotoğraf sayılarını ekle
      for (const room of rooms) {
        try {
          if (!room.roomId) {
            console.log('Room without roomId found, skipping:', room);
            continue; // Skip rooms without roomId
          }

          // Create a processed room object with validated fields
          const processedRoom = {
            roomId: room.roomId,
            roomName: room.roomName || room.name || 'Unnamed Room',
            roomType: room.roomType || room.type || 'other',
            roomQuality: room.roomQuality || null,
            roomIssueNotes: Array.isArray(room.roomIssueNotes) ? room.roomIssueNotes : [],
            photoCount: 0
          };

          // Ensure roomIssueNotes is included if roomQuality is 'attention'
          if (processedRoom.roomQuality === 'attention' && (!processedRoom.roomIssueNotes || processedRoom.roomIssueNotes.length === 0)) {
            processedRoom.roomIssueNotes = ["Needs attention"];
            console.log(`Added default note for room with attention quality but no notes: ${processedRoom.roomId}`);
          }

          // Oda için fotoğrafları getir
          const photos = await Photo.findByRoomId(processedRoom.roomId, propertyId);

          // Fotoğraf sayısını ekle
          processedRoom.photoCount = photos.length;

          // Add the processed room to our array
          processedRooms.push(processedRoom);

          console.log(`Room ${processedRoom.roomName} (ID: ${processedRoom.roomId}) has ${processedRoom.photoCount} photos, quality: ${processedRoom.roomQuality}, and ${processedRoom.roomIssueNotes.length} notes`);
        } catch (photoError) {
          console.error(`Error processing room:`, photoError);
        }
      }
    }

    console.log('Sending processed rooms to client:', processedRooms);
    res.json(processedRooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

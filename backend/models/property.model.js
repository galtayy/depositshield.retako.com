const db = require('../config/database');

class Property {
  constructor(property) {
    this.id = property.id;
    this.user_id = property.user_id;
    this.address = property.address;
    this.description = property.description;
    this.unit_number = property.unit_number;
    this.property_type = property.property_type;
    this.role_at_this_property = property.role_at_this_property;
    this.deposit_amount = property.deposit_amount;
    this.contract_start_date = property.contract_start_date;
    this.contract_end_date = property.contract_end_date;
    this.move_in_date = property.move_in_date;
    this.lease_duration = property.lease_duration;
    this.lease_duration_type = property.lease_duration_type;
    this.kitchen_count = property.kitchen_count;
    this.additional_spaces = property.additional_spaces;
    this.landlord_email = property.landlord_email;
    this.landlord_phone = property.landlord_phone;
    this.created_at = property.created_at;
    this.updated_at = property.updated_at;
  }

  // Mülk oluşturma
  static async create(newProperty) {
    try {
      console.log('Creating property with model data:', newProperty);

      // Check if unit_number column exists
      let hasUnitNumberColumn = false;
      try {
        // Try to get schema information
        const [columns] = await db.execute('SHOW COLUMNS FROM properties LIKE "unit_number"');
        hasUnitNumberColumn = columns.length > 0;
        console.log('Unit number column exists in CREATE method:', hasUnitNumberColumn);
      } catch (e) {
        console.warn('Failed to check for unit_number column in CREATE:', e.message);
      }
      
      // Use the appropriate query based on whether unit_number column exists
      const query = hasUnitNumberColumn ? 
        `
        INSERT INTO properties
        (user_id, address, description, unit_number, role_at_this_property, deposit_amount, contract_start_date, contract_end_date,
         move_in_date, lease_duration, lease_duration_type, kitchen_count, additional_spaces)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ` : 
        `
        INSERT INTO properties
        (user_id, address, description, property_type, role_at_this_property, deposit_amount, contract_start_date, contract_end_date,
         move_in_date, lease_duration, lease_duration_type, kitchen_count, additional_spaces)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

      // Process date and numeric values to ensure correct format
      const deposit = newProperty.deposit_amount ? parseInt(newProperty.deposit_amount, 10) : null;
      
      // IMPORTANT: Use dates directly from frontend without transformation
      // This prevents timezone issues by trusting the format from frontend (YYYY-MM-DD)
      const contractStart = newProperty.contract_start_date || null;
      const contractEnd = newProperty.contract_end_date || null;
      const moveInDate = newProperty.move_in_date || null;
      
      // Log original dates from the frontend
      console.log('Original date values from frontend:');
      console.log('- Contract Start (original):', newProperty.contract_start_date);
      console.log('- Contract End (original):', newProperty.contract_end_date);
      console.log('- Move In Date (original):', newProperty.move_in_date);
      
      // Extract unit number and set property type
      const unitNumber = newProperty.unit_number || null;
      const propertyType = newProperty.property_type || 'apartment';
      console.log('Unit number:', unitNumber);
      console.log('Property type:', propertyType);

      // Debug - check if unit_number is being passed correctly
      console.log('Creating property with unit_number:', unitNumber);
      
      // Prepare parameters based on schema
      const params = hasUnitNumberColumn ? [
        newProperty.user_id,
        newProperty.address,
        newProperty.description,
        unitNumber, // Separate unit_number field
        newProperty.role_at_this_property || 'renter',
        deposit,
        contractStart,
        contractEnd,
        moveInDate,
        newProperty.lease_duration || null,
        newProperty.lease_duration_type || 'months',
        newProperty.kitchen_count || null,
        newProperty.additional_spaces || null
      ] : [
        newProperty.user_id,
        newProperty.address,
        newProperty.description,
        unitNumber, // Use unit_number as property_type if column doesn't exist
        newProperty.role_at_this_property || 'renter',
        deposit,
        contractStart,
        contractEnd,
        moveInDate,
        newProperty.lease_duration || null,
        newProperty.lease_duration_type || 'months',
        newProperty.kitchen_count || null,
        newProperty.additional_spaces || null
      ];
      
      const [result] = await db.execute(query, params);

      console.log(`Property created, new ID: ${result.insertId}, affected rows: ${result.affectedRows}`);
      return result.insertId;
    } catch (error) {
      console.error('Error in Property.create:', error);
      throw error;
    }
  }

  // Mülk detaylarını getirme
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM properties WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Mülk güncelleme
  static async update(id, propertyData) {
    try {
      console.log('Updating property with data:', propertyData);
      console.log('_basic_property_update flag is:', propertyData._basic_property_update);
      console.log('typeof _basic_property_update:', typeof propertyData._basic_property_update);

      // SPECIAL UPDATE for basic property fields only (edit.js)
      // Değeri string "true" olarak da kontrol ediyoruz
      if (propertyData._basic_property_update === true || propertyData._basic_property_update === 'true') {
        console.log('✅ SPECIAL UPDATE DETECTED: Only updating basic property fields');
        console.log('This is a special update that will ONLY change address, description, and unit_number');
        console.log('All other fields, including lease details, will be preserved!');
        
        // Bu özel güncelleme SADECE temel mülk bilgilerini (address, description, unit_number) günceller
        // ve tüm kira detaylarını (lease details) ve diğer alanları KORUR!
        const basicQuery = `
          UPDATE properties
          SET 
            address = ?, 
            description = ?, 
            unit_number = ?, 
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        
        const basicParams = [
          propertyData.address,
          propertyData.description,
          propertyData.unit_number,
          id
        ];
        
        console.log('BASIC UPDATE QUERY:', basicQuery);
        console.log('BASIC UPDATE PARAMS:', basicParams);
        
        try {
          const [result] = await db.execute(basicQuery, basicParams);
          console.log(`✅ SUCCESS! Property ${id} updated with basic fields only, affected rows: ${result.affectedRows}`);
          
          // Return immediately to prevent executing the regular update code
          return result.affectedRows > 0;
        } catch (basicUpdateError) {
          console.error('ERROR in basic property update:', basicUpdateError);
          throw basicUpdateError;
        }
      }
      
      console.log('⚠️ NORMAL UPDATE: This is not a basic property update. All fields may be affected.');
      
      // Regular full update - continue with normal logic
      // Check if unit_number column exists
      let hasUnitNumberColumn = false;
      try {
        // Try to get schema information
        const [columns] = await db.execute('SHOW COLUMNS FROM properties LIKE "unit_number"');
        hasUnitNumberColumn = columns.length > 0;
        console.log('Unit number column exists:', hasUnitNumberColumn);
      } catch (e) {
        console.warn('Failed to check for unit_number column:', e.message);
      }

      // Choose the appropriate query based on schema
      const query = hasUnitNumberColumn ? 
        `
        UPDATE properties
        SET address = ?, description = ?, unit_number = ?, property_type = ?, role_at_this_property = ?, deposit_amount = ?,
        contract_start_date = ?, contract_end_date = ?, move_in_date = ?,
        lease_duration = ?, lease_duration_type = ?, kitchen_count = ?,
        additional_spaces = ?, landlord_email = ?, landlord_phone = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        ` : 
        `
        UPDATE properties
        SET address = ?, description = ?, property_type = ?, role_at_this_property = ?, deposit_amount = ?,
        contract_start_date = ?, contract_end_date = ?, move_in_date = ?,
        lease_duration = ?, lease_duration_type = ?, kitchen_count = ?,
        additional_spaces = ?, landlord_email = ?, landlord_phone = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `;

      // Process date and numeric values to ensure correct format
      const deposit = propertyData.deposit_amount ? parseInt(propertyData.deposit_amount, 10) : null;
      
      // IMPORTANT: Use dates directly from frontend without transformation
      // This prevents timezone issues by trusting the format from frontend (YYYY-MM-DD)
      const contractStart = propertyData.contract_start_date || null;
      const contractEnd = propertyData.contract_end_date || null;
      const moveInDate = propertyData.move_in_date || null;
      
      // Log original dates from the frontend
      console.log('Original date values from frontend:');
      console.log('- Contract Start (original):', propertyData.contract_start_date);
      console.log('- Contract End (original):', propertyData.contract_end_date);
      console.log('- Move In Date (original):', propertyData.move_in_date);
      
      console.log('Formatted values for MySQL:');
      console.log('- Deposit:', deposit);
      console.log('- Contract Start:', contractStart);
      console.log('- Contract End:', contractEnd);
      console.log('- Move In Date:', moveInDate);

      // Extract unit number and set property type
      const unitNumber = propertyData.unit_number || null;
      const propertyType = propertyData.property_type || 'apartment';

      // Use valid role (must be either 'owner', 'renter', 'agent', or 'other')
      const validRole = propertyData.role_at_this_property === 'renter' || 
                       propertyData.role_at_this_property === 'owner' || 
                       propertyData.role_at_this_property === 'agent' ? 
                       propertyData.role_at_this_property : 'other';
      
      console.log('Unit number:', unitNumber);
      console.log('Property type:', propertyType);
      console.log('Role at this property:', validRole);

      // Prepare parameters based on schema
      const params = hasUnitNumberColumn ? [
        propertyData.address,
        propertyData.description,
        unitNumber, // Separate unit_number field
        propertyType, // Property type
        validRole, // Use valid role value
        deposit,
        contractStart,
        contractEnd,
        moveInDate,
        propertyData.lease_duration || null,
        propertyData.lease_duration_type || 'months',
        propertyData.kitchen_count || null,
        propertyData.additional_spaces || null,
        propertyData.landlord_email || null,
        propertyData.landlord_phone || null,
        id
      ] : [
        propertyData.address,
        propertyData.description,
        propertyType, // Property type (contains unit number if no separate column)
        validRole, // Use valid role value
        deposit,
        contractStart,
        contractEnd,
        moveInDate,
        propertyData.lease_duration || null,
        propertyData.lease_duration_type || 'months',
        propertyData.kitchen_count || null,
        propertyData.additional_spaces || null,
        propertyData.landlord_email || null,
        propertyData.landlord_phone || null,
        id
      ];
      
      // Execute with appropriate params
      const [result] = await db.execute(query, params);

      console.log(`Property ${id} updated with basic fields, affected rows: ${result.affectedRows}`);
      console.log("To add support for all property fields, run: node update_property_fields.js");
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Property.update:', error);
      throw error;
    }
  }

  // Mülk silme
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM properties WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının belirli bir mülke erişim izni var mı kontrol et
  static async isPropertyOwner(propertyId, userId) {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM properties WHERE id = ? AND user_id = ?',
        [propertyId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // Oda bilgilerini kaydetme
  static async saveRooms(propertyId, rooms) {
    try {
      console.log(`Saving ${rooms.length} rooms for property ${propertyId}`);  
      
      // Önce veritabanında rooms tablosu var mı kontrol edelim
      try {
        await db.execute(`
          CREATE TABLE IF NOT EXISTS property_rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            property_id INT NOT NULL,
            room_id VARCHAR(50) NOT NULL,
            room_name VARCHAR(100) NOT NULL,
            room_type VARCHAR(50) NOT NULL,
            room_quality VARCHAR(50) NULL,
            room_issue_notes TEXT NULL,
            photo_count INT DEFAULT 0,
            timestamp VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
            UNIQUE KEY (property_id, room_id)
          ) ENGINE=InnoDB;
        `);
        console.log('Ensured property_rooms table exists');
      } catch (e) {
        console.error('Error checking/creating property_rooms table:', e);
      }
      
      // Her oda için kayıt veya güncelleme işlemi yap
      let successCount = 0;
      
      for (const room of rooms) {
        try {
          // Önce mevcut odayı kontrol et
          const [existingRooms] = await db.execute(
            'SELECT id FROM property_rooms WHERE property_id = ? AND room_id = ?',
            [propertyId, room.roomId]
          );
          
          // Oda varsa güncelle, yoksa ekle
          if (existingRooms.length > 0) {
            // Mevcut odayı güncelle
            const [updateResult] = await db.execute(`
              UPDATE property_rooms 
              SET room_name = ?, room_type = ?, room_quality = ?, 
                  room_issue_notes = ?, photo_count = ?, timestamp = ?
              WHERE property_id = ? AND room_id = ?
            `, [
              room.roomName,
              room.roomType,
              room.roomQuality,
              Array.isArray(room.roomIssueNotes) ? JSON.stringify(room.roomIssueNotes) : null,
              room.photoCount || 0,
              room.timestamp,
              propertyId,
              room.roomId
            ]);
            
            if (updateResult.affectedRows > 0) {
              successCount++;
            }
          } else {
            // Yeni oda ekle
            const [insertResult] = await db.execute(`
              INSERT INTO property_rooms 
              (property_id, room_id, room_name, room_type, room_quality, room_issue_notes, photo_count, timestamp)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              propertyId,
              room.roomId,
              room.roomName,
              room.roomType,
              room.roomQuality,
              Array.isArray(room.roomIssueNotes) ? JSON.stringify(room.roomIssueNotes) : null,
              room.photoCount || 0,
              room.timestamp
            ]);
            
            if (insertResult.affectedRows > 0) {
              successCount++;
            }
          }
        } catch (roomError) {
          console.error(`Error saving room ${room.roomId}:`, roomError);
        }
      }
      
      console.log(`Successfully saved/updated ${successCount} out of ${rooms.length} rooms`);
      return successCount > 0;
    } catch (error) {
      console.error('Error in Property.saveRooms:', error);
      throw error;
    }
  }
  
  // Oda bilgilerini getirme
  static async getRooms(propertyId) {
    try {
      console.log(`Getting rooms for property ${propertyId}`);
      
      // Önce tablo var mı kontrol et
      try {
        const [tables] = await db.execute("SHOW TABLES LIKE 'property_rooms'");
        if (tables.length === 0) {
          console.log('property_rooms table does not exist yet');
          return [];
        }
      } catch (e) {
        console.error('Error checking if property_rooms table exists:', e);
        return [];
      }
      
      // Odaları getir
      const [rows] = await db.execute(
        'SELECT * FROM property_rooms WHERE property_id = ? ORDER BY created_at ASC',
        [propertyId]
      );
      
      // Sonuçları frontend formatına dönüştür
      return rows.map(row => ({
        id: row.id,
        roomId: row.room_id,
        roomName: row.room_name,
        roomType: row.room_type,
        roomQuality: row.room_quality,
        roomIssueNotes: row.room_issue_notes ? JSON.parse(row.room_issue_notes) : [],
        photoCount: row.photo_count,
        timestamp: row.timestamp,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error in Property.getRooms:', error);
      throw error;
    }
  }
  
  // Oda silme
  static async deleteRoom(propertyId, roomId) {
    try {
      console.log(`Deleting room ${roomId} from property ${propertyId}`);
      
      // Odayı sil
      const [result] = await db.execute(
        'DELETE FROM property_rooms WHERE property_id = ? AND room_id = ?',
        [propertyId, roomId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in Property.deleteRoom:', error);
      throw error;
    }
  }

  // Sadece mülkün landlord iletişim bilgilerini güncelleme
  static async updateLandlordDetails(id, landlordData) {
    try {
      console.log('Updating landlord details in model:', landlordData);
      
      // Process email and phone for storage
      const email = landlordData.email ? (landlordData.email.trim() || null) : null;
      const phone = landlordData.phone ? (landlordData.phone.trim() || null) : null;
      
      console.log('Processed landlord details for DB:', { email, phone });
      
      const query = `
        UPDATE properties
        SET landlord_email = ?, landlord_phone = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [
        email,
        phone,
        id
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Update landlord details error:', error);
      throw error;
    }
  }

  // Kullanıcıya ait tüm mülkleri getirme
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Helper function for date formatting
  static formatDateForMySQL(dateString) {
    if (!dateString) return null;
    
    try {
      console.log(`Formatting date for MySQL: ${dateString}`);
      
      // If date is already in YYYY-MM-DD format and doesn't have time component, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.log(`Date is already in YYYY-MM-DD format: ${dateString}`);
        return dateString;
      }
      
      // If date includes T (ISO format), extract the date part
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        console.log(`Extracted date part from ISO format: ${datePart}`);
        return datePart;
      }
      
      // For other formats, try direct parsing without timezone adjustment
      // This is a special approach that avoids timezone issues by using string manipulation
      // We are assuming the date is in a recognizable format
      try {
        // Try to manually parse the date parts
        let parts;
        if (dateString.includes('/')) {
          parts = dateString.split('/');
        } else if (dateString.includes('-')) {
          parts = dateString.split('-');
        } else if (dateString.includes('.')) {
          parts = dateString.split('.');
        }
        
        if (parts && parts.length === 3) {
          let year, month, day;
          
          // Try to detect the format (mm/dd/yyyy or dd/mm/yyyy or yyyy/mm/dd)
          // Assuming any number > 31 is a year
          if (parseInt(parts[0]) > 31) {
            // Format is yyyy/mm/dd
            year = parts[0];
            month = parts[1].padStart(2, '0');
            day = parts[2].padStart(2, '0');
          } else if (parseInt(parts[2]) > 31) {
            // Format is dd/mm/yyyy or mm/dd/yyyy
            year = parts[2];
            // Assume mm/dd if month looks valid (1-12)
            if (parseInt(parts[0]) <= 12) {
              month = parts[0].padStart(2, '0');
              day = parts[1].padStart(2, '0');
            } else {
              month = parts[1].padStart(2, '0');
              day = parts[0].padStart(2, '0');
            }
          }
          
          if (year && month && day) {
            const formattedDate = `${year}-${month}-${day}`;
            console.log(`Manually parsed date: ${dateString} → ${formattedDate}`);
            return formattedDate;
          }
        }
      } catch (parseError) {
        console.warn(`Manual parsing failed: ${parseError.message}`);
      }
      
      // If all direct parsing attempts fail, use the JavaScript Date object as last resort
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}, returning null`);
        return null;
      }
      
      // Get date parts in local timezone to avoid shifts (this is important!)
      const originalDay = date.getDate();
      
      // Force a direct string manipulation by getting individual parts and formatting
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = originalDay.toString().padStart(2, '0');
      
      const formattedDate = `${year}-${month}-${day}`;
      console.log(`Formatted using Date object: ${dateString} → ${formattedDate}`);
      return formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
  }
}

module.exports = Property;
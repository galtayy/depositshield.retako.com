const db = require('../config/database');

class Property {
  constructor(property) {
    this.id = property.id;
    this.user_id = property.user_id;
    this.address = property.address;
    this.description = property.description;
    this.role_at_this_property = property.role_at_this_property;
    this.deposit_amount = property.deposit_amount;
    this.contract_start_date = property.contract_start_date;
    this.contract_end_date = property.contract_end_date;
    this.kitchen_count = property.kitchen_count;
    this.additional_spaces = property.additional_spaces;
    this.created_at = property.created_at;
    this.updated_at = property.updated_at;
  }

  // Mülk oluşturma
  static async create(newProperty) {
    try {
      const query = `
        INSERT INTO properties 
        (user_id, address, description, role_at_this_property, deposit_amount, contract_start_date, contract_end_date, kitchen_count, additional_spaces) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newProperty.user_id,
        newProperty.address,
        newProperty.description,
        newProperty.role_at_this_property,
        newProperty.deposit_amount || null,
        newProperty.contract_start_date || null,
        newProperty.contract_end_date || null,
        newProperty.kitchen_count || null,
        newProperty.additional_spaces || null,
      ]);

      return result.insertId;
    } catch (error) {
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
      const query = `
        UPDATE properties 
        SET address = ?, description = ?, role_at_this_property = ?, deposit_amount = ?, contract_start_date = ?, contract_end_date = ?, kitchen_count = ?, additional_spaces = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [
        propertyData.address,
        propertyData.description,
        propertyData.role_at_this_property,
        propertyData.deposit_amount || null,
        propertyData.contract_start_date || null,
        propertyData.contract_end_date || null,
        propertyData.kitchen_count || null,
        propertyData.additional_spaces || null,
        id
      ]);

      return result.affectedRows > 0;
    } catch (error) {
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
}

module.exports = Property;

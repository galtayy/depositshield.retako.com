const db = require('../config/database');

class Property {
  constructor(property) {
    this.id = property.id;
    this.user_id = property.user_id;
    this.address = property.address;
    this.description = property.description;
    this.role_at_this_property = property.role_at_this_property;
    this.created_at = property.created_at;
    this.updated_at = property.updated_at;
  }

  // Mülk oluşturma
  static async create(newProperty) {
    try {
      const query = `
        INSERT INTO properties 
        (user_id, address, description, role_at_this_property) 
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newProperty.user_id,
        newProperty.address,
        newProperty.description,
        newProperty.role_at_this_property,
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
        SET address = ?, description = ?, role_at_this_property = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [
        propertyData.address,
        propertyData.description,
        propertyData.role_at_this_property,
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

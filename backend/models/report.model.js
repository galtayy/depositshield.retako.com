const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Report {
  constructor(report) {
    this.id = report.id;
    this.property_id = report.property_id;
    this.created_by = report.created_by;
    this.type = report.type;
    this.uuid = report.uuid || uuidv4();
    this.title = report.title;
    this.description = report.description;
    this.created_at = report.created_at;
    this.updated_at = report.updated_at;
  }

  // Rapor oluşturma
  static async create(newReport) {
    try {
      const query = `
        INSERT INTO reports 
        (property_id, created_by, type, uuid, title, description) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newReport.property_id,
        newReport.created_by,
        newReport.type,
        newReport.uuid || uuidv4(),
        newReport.title,
        newReport.description
      ]);

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcıya ait tüm raporları getirme
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT r.*, p.address, p.role_at_this_property 
        FROM reports r
        JOIN properties p ON r.property_id = p.id
        WHERE r.created_by = ?
        ORDER BY r.created_at DESC
      `;
      
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Mülke ait tüm raporları getirme
  static async findByPropertyId(propertyId) {
    try {
      const query = `
        SELECT r.*, u.name as creator_name, u.email as creator_email, p.role_at_this_property
        FROM reports r
        JOIN users u ON r.created_by = u.id
        JOIN properties p ON r.property_id = p.id
        WHERE r.property_id = ?
        ORDER BY r.created_at DESC
      `;
      
      const [rows] = await db.execute(query, [propertyId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Rapor detaylarını getirme
  static async findById(id) {
    try {
      const query = `
        SELECT r.*, u.name as creator_name, p.address, p.role_at_this_property 
        FROM reports r
        JOIN users u ON r.created_by = u.id
        JOIN properties p ON r.property_id = p.id
        WHERE r.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // UUID ile rapor bulma
  static async findByUuid(uuid) {
    try {
      const query = `
        SELECT r.*, u.name as creator_name, p.address, p.role_at_this_property 
        FROM reports r
        JOIN users u ON r.created_by = u.id
        JOIN properties p ON r.property_id = p.id
        WHERE r.uuid = ?
      `;
      
      const [rows] = await db.execute(query, [uuid]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Rapor güncelleme
  static async update(id, reportData) {
    try {
      const query = `
        UPDATE reports 
        SET title = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [
        reportData.title,
        reportData.description,
        reportData.type,
        id
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Rapor silme
  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM reports WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcının belirli bir rapora erişim izni var mı kontrol et
  static async isReportOwner(reportId, userId) {
    try {
      const [rows] = await db.execute(
        'SELECT id FROM reports WHERE id = ? AND created_by = ?',
        [reportId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Raporu görüntüleme kaydı tutma
  static async logReportView(reportId, viewerId) {
    try {
      const query = `
        INSERT INTO report_views 
        (report_id, viewer_id, viewed_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `;

      const [result] = await db.execute(query, [reportId, viewerId]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Report;

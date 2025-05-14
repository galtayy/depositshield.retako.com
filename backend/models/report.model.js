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
      // UUID var mı kontrol et, yoksa oluştur
      const uuid = newReport.uuid || uuidv4();
      console.log(`[INFO] Creating report with UUID: ${uuid}`);
      
      // Odalar varsa rooms_json alanına kaydet
      let roomsJson = null;
      
      if (newReport.rooms_json) {
        roomsJson = newReport.rooms_json;
        console.log(`[INFO] Using provided rooms_json data (${roomsJson.length} bytes)`);
      } else if (newReport.rooms) {
        roomsJson = JSON.stringify(newReport.rooms);
        console.log(`[INFO] Converting rooms to JSON data (${roomsJson.length} bytes)`);
      }
      
      const query = `
        INSERT INTO reports 
        (property_id, created_by, type, uuid, title, description, rooms_json) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newReport.property_id,
        newReport.created_by,
        newReport.type,
        uuid,
        newReport.title,
        newReport.description,
        roomsJson
      ]);
      
      console.log(`[INFO] Report created successfully with ID: ${result.insertId}, UUID: ${uuid}`);
      return result.insertId;
    } catch (error) {
      console.error('[ERROR] Failed to create report:', error);
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
      // is_archived kolonunu sorgudan çıkartalım, çünkü veritabanında yok
      const query = `
        SELECT r.*, r.approval_status, r.approved_at, r.rejected_at,
        u.name as creator_name, u.email as creator_email, p.address, p.role_at_this_property,
               CASE 
                WHEN p.role_at_this_property = 'landlord' THEN u.name 
                ELSE '' 
               END as landlord_name,
               CASE 
                WHEN p.role_at_this_property = 'landlord' THEN u.email 
                ELSE '' 
               END as landlord_email,
               CASE 
                WHEN p.role_at_this_property = 'renter' THEN u.name 
                ELSE '' 
               END as tenant_name,
               CASE 
                WHEN p.role_at_this_property = 'renter' THEN u.email 
                ELSE '' 
               END as tenant_email
        FROM reports r
        JOIN users u ON r.created_by = u.id
        JOIN properties p ON r.property_id = p.id
        WHERE r.uuid = ?
      `;
      
      const [rows] = await db.execute(query, [uuid]);
      
      if (rows.length === 0) {
        return null;
      }
      
      // Eğer tenant/landlord tanımlanmamışsa, creator bilgilerini kullan
      const report = rows[0];
      if (!report.tenant_name && !report.tenant_email) {
        report.tenant_name = report.creator_name;
        report.tenant_email = report.creator_email;
      }
      if (!report.landlord_name && !report.landlord_email) {
        report.landlord_name = 'Property Owner';
        report.landlord_email = process.env.EMAIL_FROM; // Varsayılan sistem e-postası
      }
      
      // Varsayılan olarak is_archived = false ekleyelim
      report.is_archived = false;
      
      return report;
    } catch (error) {
      console.error('UUID ile rapor bulma hatası:', error);
      throw error;
    }
  }

  // Helper method to format date for MySQL
  static formatDateForMySQL(dateString) {
    if (!dateString) return null;
    
    try {
      // ISO string'i Date objesine çevir
      const date = new Date(dateString);
      
      // MySQL datetime format: YYYY-MM-DD HH:MM:SS
      return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
      console.error('Date format error:', error);
      return null;
    }
  }

  // Rapor güncelleme
  static async update(id, reportData) {
    try {
      // Temel rapor alanlarını güncelleme için dinamik SQL oluşturma
      let fields = [];
      let values = [];
      
      // İçerik değişikliği varsa, onay durumunu null yap
      const contentChanged = reportData.title !== undefined || 
                          reportData.description !== undefined || 
                          reportData.type !== undefined;
      
      // Rapor temel bilgileri
      if (reportData.title !== undefined) {
        fields.push('title = ?');
        values.push(reportData.title);
      }
      
      if (reportData.description !== undefined) {
        fields.push('description = ?');
        values.push(reportData.description);
      }
      
      if (reportData.type !== undefined) {
        fields.push('type = ?');
        values.push(reportData.type);
      }
      
      // İçerik değiştiğinde onay durumunu sıfırla (reddedilmiş raporlar için)
      if (contentChanged && reportData.reset_approval !== false) {
        fields.push('approval_status = ?');
        values.push(null);
        
        // Onaylanma ve reddedilme zamanlarını sıfırla
        fields.push('approved_at = ?');
        values.push(null);
        
        fields.push('rejected_at = ?');
        values.push(null);
        
        fields.push('rejection_message = ?');
        values.push(null);
      } else {
        // Onay durumu ile ilgili alanlar manuel olarak belirtilmişse
        if (reportData.approval_status !== undefined) {
          fields.push('approval_status = ?');
          values.push(reportData.approval_status);
        }
        
        if (reportData.approved_at !== undefined) {
          fields.push('approved_at = ?');
          values.push(Report.formatDateForMySQL(reportData.approved_at));
        }
        
        if (reportData.rejected_at !== undefined) {
          fields.push('rejected_at = ?');
          values.push(Report.formatDateForMySQL(reportData.rejected_at));
        }
        
        if (reportData.approved_message !== undefined) {
          fields.push('approved_message = ?');
          values.push(reportData.approved_message);
        }
        
        if (reportData.rejection_message !== undefined) {
          fields.push('rejection_message = ?');
          values.push(reportData.rejection_message);
        }
      }
      
      // UUID güncelleme isteği varsa yeni UUID oluştur
      if (reportData.generate_new_uuid) {
        const { v4: uuidv4 } = require('uuid');
        fields.push('uuid = ?');
        values.push(uuidv4());
      }
      
      // Arşiv ile ilgili alanlar
      if (reportData.is_archived !== undefined) {
        fields.push('is_archived = ?');
        values.push(reportData.is_archived);
      }
      
      if (reportData.archived_at !== undefined) {
        fields.push('archived_at = ?');
        values.push(Report.formatDateForMySQL(reportData.archived_at));
      }
      
      if (reportData.archive_reason !== undefined) {
        fields.push('archive_reason = ?');
        values.push(reportData.archive_reason);
      }
      
      // Güncellenme zamanını her zaman ekle
      fields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Eğer güncelleme alanı yoksa, false döndür
      if (fields.length === 1) { // Sadece updated_at varsa
        return false;
      }
      
      const query = `
        UPDATE reports 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `;
      
      // id değerini values array'ine ekle
      values.push(id);

      const [result] = await db.execute(query, values);

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
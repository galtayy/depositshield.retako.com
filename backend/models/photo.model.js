const db = require('../config/database');

class Photo {
  constructor(photo) {
    this.id = photo.id;
    this.report_id = photo.report_id;
    this.room_id = photo.room_id;
    this.property_id = photo.property_id;
    this.file_path = photo.file_path;
    this.note = photo.note;
    this.timestamp = photo.timestamp;
    this.uploaded_at = photo.uploaded_at;
  }

  // Fotoğraf oluşturma
  static async create(newPhoto) {
    try {
      const query = `
        INSERT INTO photos
        (report_id, room_id, property_id, file_path, note, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.execute(query, [
        newPhoto.report_id || null,
        newPhoto.room_id || null,
        newPhoto.property_id || null,
        newPhoto.file_path,
        newPhoto.note || null,
        newPhoto.timestamp || new Date()
      ]);

      const photoId = result.insertId;
      
      // Etiketler varsa ekle
      if (newPhoto.tags && newPhoto.tags.length > 0) {
        for (let tag of newPhoto.tags) {
          await this.addTag(photoId, tag);
        }
      }

      return photoId;
    } catch (error) {
      throw error;
    }
  }

  // Rapora ait tüm fotoğrafları getirme
  static async findByReportId(reportId) {
    try {
      const query = `
        SELECT p.*, GROUP_CONCAT(t.tag) as tags
        FROM photos p
        LEFT JOIN photo_tags t ON p.id = t.photo_id
        WHERE p.report_id = ?
        GROUP BY p.id
        ORDER BY p.timestamp ASC
      `;

      const [rows] = await db.execute(query, [reportId]);

      // Etiketleri diziye dönüştür
      return rows.map(row => {
        return {
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Odaya ait tüm fotoğrafları getirme
  static async findByRoomId(roomId, propertyId) {
    try {
      const query = `
        SELECT p.*, GROUP_CONCAT(t.tag) as tags
        FROM photos p
        LEFT JOIN photo_tags t ON p.id = t.photo_id
        WHERE p.room_id = ? AND p.property_id = ?
        GROUP BY p.id
        ORDER BY p.timestamp ASC
      `;

      const [rows] = await db.execute(query, [roomId, propertyId]);

      // Etiketleri diziye dönüştür
      return rows.map(row => {
        return {
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Mülke ait tüm fotoğrafları getirme (odalarla birlikte)
  static async findByPropertyId(propertyId) {
    try {
      const query = `
        SELECT p.*, GROUP_CONCAT(t.tag) as tags
        FROM photos p
        LEFT JOIN photo_tags t ON p.id = t.photo_id
        WHERE p.property_id = ?
        GROUP BY p.id
        ORDER BY p.room_id, p.timestamp ASC
      `;

      const [rows] = await db.execute(query, [propertyId]);

      // Etiketleri diziye dönüştür
      return rows.map(row => {
        return {
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Fotoğraf detaylarını getirme
  static async findById(id) {
    try {
      const query = `
        SELECT p.*, GROUP_CONCAT(t.tag) as tags 
        FROM photos p
        LEFT JOIN photo_tags t ON p.id = t.photo_id
        WHERE p.id = ?
        GROUP BY p.id
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) return null;
      
      // Etiketleri diziye dönüştür
      return {
        ...rows[0],
        tags: rows[0].tags ? rows[0].tags.split(',') : []
      };
    } catch (error) {
      throw error;
    }
  }

  // Fotoğraf notunu güncelleme
  static async updateNote(id, note) {
    try {
      const query = `
        UPDATE photos 
        SET note = ? 
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [note, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Fotoğrafa etiket ekleme
  static async addTag(photoId, tag) {
    try {
      // Etiketin zaten var olup olmadığını kontrol et
      const [existingTags] = await db.execute(
        'SELECT id FROM photo_tags WHERE photo_id = ? AND tag = ?',
        [photoId, tag]
      );
      
      if (existingTags.length > 0) {
        return existingTags[0].id; // Zaten var, ID'yi döndür
      }
      
      // Yeni etiket ekle
      const query = `
        INSERT INTO photo_tags 
        (photo_id, tag) 
        VALUES (?, ?)
      `;

      const [result] = await db.execute(query, [photoId, tag]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Fotoğraftan etiket silme
  static async removeTag(photoId, tag) {
    try {
      const query = `
        DELETE FROM photo_tags 
        WHERE photo_id = ? AND tag = ?
      `;

      const [result] = await db.execute(query, [photoId, tag]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Fotoğraf silme
  static async delete(id) {
    try {
      // Önce etiketleri sil
      await db.execute('DELETE FROM photo_tags WHERE photo_id = ?', [id]);
      
      // Sonra fotoğrafı sil
      const [result] = await db.execute('DELETE FROM photos WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Photo;

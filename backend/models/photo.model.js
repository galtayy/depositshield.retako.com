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
      console.log(`[DEBUG PHOTO] Finding photos for report ID: ${reportId}`);
      
      // Önce rapor fotoğraflarını kontrol ediyoruz - DISTINCT ile tekrar eden kayıtları önleme
      const photoQuery = `
        SELECT DISTINCT p.*, GROUP_CONCAT(t.tag) as tags
        FROM photos p
        LEFT JOIN photo_tags t ON p.id = t.photo_id
        WHERE p.report_id = ?
        GROUP BY p.id
        ORDER BY p.timestamp ASC
      `;

      const [photoRows] = await db.execute(photoQuery, [reportId]);
      console.log(`[DEBUG PHOTO] Direct report photos found: ${photoRows.length}`);
      
      if (photoRows.length === 0) {
        // Eğer hiç fotoğraf bulunamadıysa, associate tablosu üzerinden kontrol et
        console.log(`[DEBUG PHOTO] No direct photos found, checking associations...`);
        
        const associationQuery = `
          SELECT p.*, GROUP_CONCAT(t.tag) as tags
          FROM photos p
          LEFT JOIN photo_tags t ON p.id = t.photo_id
          WHERE p.id IN (
            SELECT photo_id FROM photo_report_association WHERE report_id = ?
          )
          GROUP BY p.id
          ORDER BY p.timestamp ASC
        `;
        
        try {
          const [associationRows] = await db.execute(associationQuery, [reportId]);
          console.log(`[DEBUG PHOTO] Association photos found: ${associationRows.length}`);
          
          if (associationRows.length > 0) {
            // Association tablosundan fotoğraf bulundu
            return associationRows.map(row => {
              return {
                ...row,
                tags: row.tags ? row.tags.split(',') : []
              };
            });
          }
        } catch (err) {
          // Association tablosu olmayabilir, normal devam et
          console.log(`[DEBUG PHOTO] No association table found: ${err.message}`);
        }
      }

      // Etiketleri diziye dönüştür ve sonucu döndür
      const result = photoRows.map(row => {
        return {
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        };
      });
      
      // Son çare olarak, doğrudan room_id ile eşleşen fotoğrafları da bul
      if (result.length === 0) {
        try {
          // Rapora ait odaları JSON'dan çıkar
          const reportQuery = 'SELECT rooms_json FROM reports WHERE id = ?';
          const [reportRows] = await db.execute(reportQuery, [reportId]);
          
          if (reportRows.length > 0 && reportRows[0].rooms_json) {
            const roomsJson = JSON.parse(reportRows[0].rooms_json);
            const roomIds = roomsJson.map(room => room.id);
            
            if (roomIds.length > 0) {
              console.log(`[DEBUG PHOTO] Searching photos for room IDs: ${roomIds.join(', ')}`);
              
              // Bu odalar için fotoğrafları bul (report_id boş olsa bile)
              const roomPhotosQuery = `
                SELECT p.*, GROUP_CONCAT(t.tag) as tags
                FROM photos p
                LEFT JOIN photo_tags t ON p.id = t.photo_id
                WHERE p.room_id IN (${roomIds.map(() => '?').join(',')})
                GROUP BY p.id
                ORDER BY p.timestamp ASC
              `;
              
              const [roomPhotoRows] = await db.execute(roomPhotosQuery, [...roomIds]);
              console.log(`[DEBUG PHOTO] Found ${roomPhotoRows.length} photos by room IDs`);
              
              if (roomPhotoRows.length > 0) {
                // Bulunan fotoğrafları dönüştür ve ekle
                const additionalPhotos = roomPhotoRows.map(row => ({
                  ...row,
                  tags: row.tags ? row.tags.split(',') : []
                }));
                
                // Eğer bu fotoğraflar bulunduysa, rapora ilişkilendir
                additionalPhotos.forEach(async photo => {
                  try {
                    await db.execute(
                      'UPDATE photos SET report_id = ? WHERE id = ? AND report_id IS NULL',
                      [reportId, photo.id]
                    );
                    console.log(`[DEBUG PHOTO] Linked photo ${photo.id} with report ${reportId}`);
                  } catch (err) {}
                });
                
                return [...result, ...additionalPhotos];
              }
            }
          }
        } catch (roomError) {
          console.error(`[ERROR PHOTO] Room search error:`, roomError);
        }
      }
      
      return result;
    } catch (error) {
      console.error(`[ERROR PHOTO] Error finding photos for report ${reportId}:`, error);
      return [];
    }
  }

  // Odaya ait tüm fotoğrafları getirme
  static async findByRoomId(roomId, propertyId) {
    try {
      let query;
      let params;
      
      // Eğer property_id varsa, o property ile filtreleme yap
      if (propertyId) {
        query = `
          SELECT p.*, GROUP_CONCAT(t.tag) as tags
          FROM photos p
          LEFT JOIN photo_tags t ON p.id = t.photo_id
          WHERE p.room_id = ? AND p.property_id = ?
          GROUP BY p.id
          ORDER BY p.timestamp ASC
        `;
        params = [roomId, propertyId];
      } else {
        // Property ID olmadan sadece room_id ile arama yap (rapor fotoğrafları için)
        query = `
          SELECT p.*, GROUP_CONCAT(t.tag) as tags
          FROM photos p
          LEFT JOIN photo_tags t ON p.id = t.photo_id
          WHERE p.room_id = ?
          GROUP BY p.id
          ORDER BY p.timestamp ASC
        `;
        params = [roomId];
      }

      console.log(`[DEBUG PHOTO] Finding photos for room ${roomId} ${propertyId ? 'and property ' + propertyId : ''}`);
      const [rows] = await db.execute(query, params);
      console.log(`[DEBUG PHOTO] Found ${rows.length} photos for room ${roomId}`);

      // Etiketleri diziye dönüştür
      return rows.map(row => {
        return {
          ...row,
          tags: row.tags ? row.tags.split(',') : []
        };
      });
    } catch (error) {
      console.error(`[ERROR PHOTO] Error finding photos for room ${roomId}:`, error);
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

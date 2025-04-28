/**
 * Simple PDF Report Generation Functions
 * This file contains simplified PDF generation functions that avoid font-related issues
 */

// Import font support module
import { addTurkishFontSupport } from './addFontToPdf';

/**
 * Generates a PDF from the report detail page
 * @param {Object} report - Report data
 * @param {Array} photos - Report photos
 * @returns {Promise<jsPDF>} - the generated PDF
 */
export const generateReportPDF = async (report, photos = []) => {
  console.log('generateReportPDF started with:', { 
    reportId: report?.id, 
    photosCount: Array.isArray(photos) ? photos.length : 'not an array'
  });
  
  // Ensure data safety
  photos = Array.isArray(photos) ? photos : [];
  report = report || {};
  
  try {
    // Dynamically import jsPDF module
    let jsPDF;
    try {
      // Modern import syntax
      const jspdfModule = await import('jspdf');
      jsPDF = jspdfModule.jsPDF;
      console.log('jsPDF imported successfully from jspdf module');
    } catch (importError) {
      console.error('Error importing jsPDF as a named export:', importError);
      
      // Legacy import as default
      try {
        const jspdfDefault = await import('jspdf');
        jsPDF = jspdfDefault.default;
        console.log('jsPDF imported successfully as default export');
      } catch (defaultImportError) {
        console.error('Error importing jsPDF as default export:', defaultImportError);
        throw new Error('Failed to import jsPDF library: ' + importError.message);
      }
    }
    
    if (!jsPDF) {
      throw new Error('jsPDF library could not be loaded');
    }
    
    console.log('Creating new jsPDF instance');
    // Create PDF document with UTF-8 support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    // PDF settings
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    
    // Header area
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text('DepositShield', margin, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Property Reporting System', margin, 25);
    
    // Draw a line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, 30, pageWidth - margin, 30);
    
    // Report Title
    yPosition = 40;
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    
    // Ensure title is a string
    const title = report.title ? String(report.title) : 'Property Report';
    pdf.text('Property Report: ' + title, margin, yPosition);
    yPosition += 10;
    
    // Report Type
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    let reportTypeLabel = 'General Observation';
    
    switch(report.type) {
      case 'move-in':
        reportTypeLabel = 'Pre-Move-In Report';
        break;
      case 'move-out':
        reportTypeLabel = 'Post-Move-Out Report';
        break;
    }
    
    pdf.text(reportTypeLabel, margin, yPosition);
    yPosition += 15;
    
    // Property Address
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Property Address:', margin, yPosition);
    yPosition += 7;
    
    pdf.setTextColor(0, 0, 0);
    // Split long addresses (address may be undefined)
    const address = report.address ? String(report.address) : 'Address not available';
    const addressLines = pdf.splitTextToSize(address, contentWidth - 10);
    pdf.text(addressLines, margin, yPosition);
    yPosition += addressLines.length * 7 + 5;
    
    // Report Date
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Report Date:', margin, yPosition);
    yPosition += 7;
    
    pdf.setTextColor(0, 0, 0);
    let formattedDate = 'Date not available';
    try {
      if (report.created_at) {
        // Include time in the date format
        formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      // Fallback
      if (report.created_at) {
        const date = new Date(report.created_at);
        formattedDate = date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
      }
    }
    pdf.text(formattedDate, margin, yPosition);
    yPosition += 10;
    
    // Approval Status
    if (report.approval_status) {
      yPosition += 5;
      
      if (report.approval_status === 'approved') {
        pdf.setTextColor(16, 185, 129); // Green
        pdf.text('APPROVED BY LANDLORD', margin, yPosition);
      } else if (report.approval_status === 'rejected') {
        pdf.setTextColor(239, 68, 68); // Red
        pdf.text('REJECTED BY LANDLORD', margin, yPosition);
        
        // Rejection reason
        if (report.rejection_message) {
          yPosition += 7;
          pdf.setFontSize(10);
          pdf.text('Rejection Reason:', margin, yPosition);
          yPosition += 5;
          
          const reasonText = String(report.rejection_message || '');
          const reasonLines = pdf.splitTextToSize(reasonText, contentWidth - 10);
          pdf.text(reasonLines, margin, yPosition);
          yPosition += reasonLines.length * 6 + 5;
        }
      }
      
      yPosition += 10;
    }
    
    // Tenant Information
    if (report.tenant_name || report.tenant_email || report.creator_name) {
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Tenant Information:', margin, yPosition);
      yPosition += 7;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      if (report.tenant_name) {
        pdf.text('Name: ' + String(report.tenant_name), margin, yPosition);
        yPosition += 6;
      } else if (report.creator_name) {
        pdf.text('Name: ' + String(report.creator_name), margin, yPosition);
        yPosition += 6;
      }
      
      if (report.tenant_email) {
        pdf.text('Email: ' + String(report.tenant_email), margin, yPosition);
        yPosition += 6;
      }
      
      yPosition += 10;
    }
    
    // Report Description
    if (report.description) {
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Report Description:', margin, yPosition);
      yPosition += 7;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      const descText = String(report.description || '');
      const descriptionLines = pdf.splitTextToSize(descText, contentWidth - 10);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 6 + 10;
    }
    
    // Photos section removed as requested - only keeping the "Rooms and Photos" section
    
    // Group photos by rooms
    const photosByRoom = {};
    photos.forEach(photo => {
      if (photo && photo.tags && photo.tags.length > 0) {
        const roomTag = photo.tags[0];
        if (!photosByRoom[roomTag]) {
          photosByRoom[roomTag] = [];
        }
        photosByRoom[roomTag].push(photo);
      }
    });
    
    // Show room photos
    if (Object.keys(photosByRoom).length > 0) {
      // Start a new page for rooms listing
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Rooms and Photos', margin, yPosition);
      yPosition += 10;
      
      // Show all rooms with their photos
      const roomEntries = Object.entries(photosByRoom);
      for (let i = 0; i < roomEntries.length; i++) {
        const [roomName, roomPhotos] = roomEntries[i];
        
        // Room header
        pdf.setFontSize(12);
        pdf.setTextColor(30, 64, 175); // Dark blue
        pdf.text(String(roomName) + ' (' + String(roomPhotos.length) + ' photos)', margin, yPosition);
        yPosition += 6;
        
        // Show a few photos from each room
        const samplePhotos = roomPhotos.slice(0, 2).filter(photo => photo.base64);
        if (samplePhotos.length > 0) {
          for (let j = 0; j < samplePhotos.length; j++) {
            const photo = samplePhotos[j];
            try {
              // Check for space
              if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = margin;
                
                // Room header continuation
                pdf.setFontSize(12);
                pdf.setTextColor(30, 64, 175);
                pdf.text(String(roomName) + ' (continued)', margin, yPosition);
                yPosition += 8;
              }
              
              // Photo caption
              if (photo.note) {
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                const noteText = String(photo.note || 'Photo ' + (j+1));
                const noteLines = pdf.splitTextToSize(noteText, contentWidth - 15);
                pdf.text(noteLines, margin + 5, yPosition);
                yPosition += noteLines.length * 5 + 3;
              }
              
              // Add the image - preserving aspect ratio
              if (photo.base64) {
                try {
                  // Process image data
                  let imageData = photo.base64;
                  if (!imageData.startsWith('data:image')) {
                    imageData = 'data:image/jpeg;base64,' + imageData;
                  }
                  
                  // Prepare image dimensions
                  const imgWidth = contentWidth - 10;
                  const imgHeight = 70; // Taller height for better visibility

                  // Add image with padding and border
                  pdf.setFillColor(250, 250, 250);
                  pdf.roundedRect(margin + 5, yPosition, imgWidth, imgHeight + 8, 2, 2, 'F');
                  
                  pdf.addImage(
                    imageData,
                    'JPEG',
                    margin + 10,
                    yPosition + 4,
                    imgWidth - 10,
                    imgHeight,
                    '',
                    'MEDIUM'
                  );
                  
                  // Image border
                  pdf.setDrawColor(220, 220, 220);
                  pdf.rect(margin + 10, yPosition + 4, imgWidth - 10, imgHeight);
                  
                  yPosition += imgHeight + 12;
                } catch (imgProcessErr) {
                  console.error('Error processing image:', imgProcessErr);
                  yPosition += 10; // Add space in case of error
                }
              }
            } catch (imgError) {
              console.error(`Error adding room photo to PDF:`, imgError);
            }
          }
        } else {
          // Note if no photos with base64 data
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text('No viewable photos available for this room.', margin + 5, yPosition);
          yPosition += 5;
        }
        
        yPosition += 8;
        
        // Check if need new page before next room
        if (i < roomEntries.length - 1 && yPosition > pageHeight - 45) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    }
    
    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Report ID: ' + String(report.id || '') + ' | Generated on ' + new Date().toLocaleDateString('en-US'), margin, 285);
    pdf.text('DepositShield Report System', pageWidth - margin, 285, { align: 'right' });

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generates a PDF from the shared report page
 * @param {Object} report - Report data
 * @param {Array} photos - Report photos
 * @param {String} localApprovalStatus - Local approval status (if any)
 * @returns {Promise<jsPDF>} - the generated PDF
 */
export const generateSharedReportPDF = async (report, photos = [], localApprovalStatus = null) => {
  console.log('generateSharedReportPDF started with:', { 
    reportId: report?.id, 
    photosCount: Array.isArray(photos) ? photos.length : 'not an array', 
    localApprovalStatus 
  });
  
  // Ensure data safety
  photos = Array.isArray(photos) ? photos : [];
  report = report || {};
  
  try {
    // Dynamically import jsPDF module
    let jsPDF;
    try {
      // Modern import syntax
      const jspdfModule = await import('jspdf');
      jsPDF = jspdfModule.jsPDF;
      console.log('jsPDF imported successfully from jspdf module');
    } catch (importError) {
      console.error('Error importing jsPDF as a named export:', importError);
      
      // Legacy import as default
      try {
        const jspdfDefault = await import('jspdf');
        jsPDF = jspdfDefault.default;
        console.log('jsPDF imported successfully as default export');
      } catch (defaultImportError) {
        console.error('Error importing jsPDF as default export:', defaultImportError);
        throw new Error('Failed to import jsPDF library: ' + importError.message);
      }
    }
    
    if (!jsPDF) {
      throw new Error('jsPDF library could not be loaded');
    }
    
    console.log('Creating new jsPDF instance');
    // Create PDF document with UTF-8 support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    console.log('jsPDF instance created. Beginning content creation.');
    
    // PDF settings
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;
    
    // Header area
    pdf.setFillColor(249, 250, 251); // Very light gray
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    pdf.text('DepositShield', margin, 20);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Property Reporting System', margin, 25);
    
    // Draw a line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, 35, pageWidth - margin, 35);
    
    // Report Title
    yPosition = 45;
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text('PROPERTY INSPECTION REPORT', margin, yPosition);
    yPosition += 10;
    
    // Report Type
    pdf.setFontSize(14);
    pdf.setTextColor(50, 50, 50);
    let reportTypeLabel = 'General Observation';
    
    switch(report.type) {
      case 'move-in':
        reportTypeLabel = 'Pre-Move-In Report';
        break;
      case 'move-out':
        reportTypeLabel = 'Post-Move-Out Report';
        break;
    }
    
    pdf.text(reportTypeLabel, margin, yPosition);
    yPosition += 15;
    
    // Property Address
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Property Address:', margin, yPosition);
    yPosition += 7;
    
    pdf.setTextColor(0, 0, 0);
    
    // Address text
    const address = report.address ? String(report.address) : 'Address not available';
    const addressLines = pdf.splitTextToSize(address, contentWidth - 10);
    pdf.text(addressLines, margin, yPosition);
    yPosition += addressLines.length * 7 + 10;
    
    // Report ID, Date, Creator
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text('Report ID:', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(report.id || report.uuid || 'Unknown'), margin + 50, yPosition);
    yPosition += 7;
    
    pdf.setTextColor(80, 80, 80);
    pdf.text('Report Date:', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    
    let formattedDate = 'Date not available';
    try {
      // Include time in the date format
      if (report.created_at) {
        formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      if (report.created_at) {
        const date = new Date(report.created_at);
        formattedDate = date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
      }
    }
    pdf.text(formattedDate, margin + 50, yPosition);
    yPosition += 7;
    
    if (report.creator_name || report.tenant_name) {
      pdf.setTextColor(80, 80, 80);
      pdf.text('Created By:', margin, yPosition);
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(report.creator_name || report.tenant_name || 'Unknown'), margin + 50, yPosition);
      yPosition += 7;
    }
    
    // Role information removed as requested
    
    // Approval Status
    if (report.approval_status || localApprovalStatus) {
      const actualStatus = report.approval_status || localApprovalStatus;
      
      yPosition += 5;
      pdf.setFontSize(12);
      
      if (actualStatus === 'approved') {
        pdf.setTextColor(16, 185, 129); // Green
        pdf.text('APPROVED BY LANDLORD', margin, yPosition);
      } else if (actualStatus === 'rejected') {
        pdf.setTextColor(239, 68, 68); // Red
        pdf.text('REJECTED BY LANDLORD', margin, yPosition);
        
        // Rejection reason
        if (report.rejection_message) {
          yPosition += 7;
          pdf.setFontSize(10);
          pdf.text('Rejection Reason:', margin, yPosition);
          yPosition += 5;
          
          const reasonText = String(report.rejection_message || '');
          const reasonLines = pdf.splitTextToSize(reasonText, contentWidth - 10);
          pdf.text(reasonLines, margin, yPosition);
          yPosition += reasonLines.length * 6 + 5;
        }
      }
      
      yPosition += 10;
    }
    
    // Report Description
    if (report.description) {
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Report Description:', margin, yPosition);
      yPosition += 7;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      const descText = String(report.description || '');
      const descriptionLines = pdf.splitTextToSize(descText, contentWidth - 10);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 6 + 10;
    }
    
    // Tenant/Creator Information
    if (report.tenant_name || report.tenant_email || report.creator_name || report.creator_email) {
      // If we need a new page
      if (yPosition > pageHeight - 70) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text('Tenant/Creator Information:', margin, yPosition);
      yPosition += 7;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      
      if (report.tenant_name || report.creator_name) {
        pdf.text('Name: ' + String(report.tenant_name || report.creator_name), margin, yPosition);
        yPosition += 6;
      }
      
      if (report.tenant_email || report.creator_email) {
        pdf.text('Email: ' + String(report.tenant_email || report.creator_email), margin, yPosition);
        yPosition += 6;
      }
      
      if (report.tenant_phone || report.creator_phone) {
        pdf.text('Phone: ' + String(report.tenant_phone || report.creator_phone), margin, yPosition);
        yPosition += 6;
      }
      
      // Role information removed as requested
      
      yPosition += 10;
    }
    
    // Photos Section - removed standalone section as requested
    
    // Group photos by rooms
    const photosByRoom = {};
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      if (photo && photo.tags && Array.isArray(photo.tags) && photo.tags.length > 0) {
        const roomTag = photo.tags[0];
        if (!photosByRoom[roomTag]) {
          photosByRoom[roomTag] = [];
        }
        photosByRoom[roomTag].push(photo);
      }
    }
    
    // Shows all rooms photos
    if (Object.keys(photosByRoom).length > 0) {
      // If we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Rooms and Photos', margin, yPosition);
      yPosition += 10;
      
      // Show all rooms
      const roomEntries = Object.entries(photosByRoom);
      for (let i = 0; i < roomEntries.length; i++) {
        const [roomName, roomPhotos] = roomEntries[i];
        
        // Room header with fancy style
        pdf.setFillColor(245, 247, 250); // Light blue background
        pdf.roundedRect(margin, yPosition - 5, contentWidth, 12, 1, 1, 'F');
        
        pdf.setFontSize(12);
        pdf.setTextColor(30, 64, 175); // Dark blue
        pdf.text(String(roomName) + ' (' + String(roomPhotos.length) + ' photos)', margin + 3, yPosition);
        yPosition += 8;
        
        // Show a few photos for this room
        const roomPhotoSample = roomPhotos.slice(0, 2).filter(photo => photo.base64);
        if (roomPhotoSample.length > 0) {
          for (let j = 0; j < roomPhotoSample.length; j++) {
            const photo = roomPhotoSample[j];
            try {
              // Check if we need a new page
              if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = margin;
                
                // Room header continuation
                pdf.setFontSize(12);
                pdf.setTextColor(30, 64, 175);
                pdf.text(String(roomName) + ' (continued)', margin, yPosition);
                yPosition += 8;
              }
              
              // Photo caption
              if (photo.note) {
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                const noteText = String(photo.note);
                const noteLines = pdf.splitTextToSize(noteText, contentWidth - 15);
                pdf.text(noteLines, margin + 5, yPosition);
                yPosition += noteLines.length * 5 + 3;
              }
              
              // Add the image - preserving aspect ratio
              try {
                // Process image data
                let imageData = photo.base64;
                if (!imageData.startsWith('data:image')) {
                  imageData = 'data:image/jpeg;base64,' + imageData;
                }
                
                // Prepare image dimensions
                const imgWidth = contentWidth - 20;
                const imgHeight = 70; // Taller height for better visibility

                // Add image with padding and border
                pdf.setFillColor(250, 250, 250);
                pdf.roundedRect(margin + 5, yPosition, imgWidth, imgHeight + 8, 2, 2, 'F');
                
                pdf.addImage(
                  imageData,
                  'JPEG',
                  margin + 10,
                  yPosition + 4,
                  imgWidth - 10,
                  imgHeight,
                  '',
                  'MEDIUM'
                );
                
                // Image border
                pdf.setDrawColor(220, 220, 220);
                pdf.rect(margin + 10, yPosition + 4, imgWidth - 10, imgHeight);
                
                yPosition += imgHeight + 12;
              } catch (imgProcessErr) {
                console.error('Error processing image:', imgProcessErr);
                yPosition += 10; // Add space in case of error
              }
            } catch (imgError) {
              console.error(`Error adding room photo to PDF:`, imgError);
            }
          }
        } else {
          // If no photos with base64 data
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text('No viewable photos available for this room.', margin + 5, yPosition);
          yPosition += 5;
        }
        
        yPosition += 8;
        
        // Check if we need a new page before next room
        if (i < roomEntries.length - 1 && yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    }
    
    // Footer on all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const footerText = 'Report ID: ' + String(report.id || report.uuid || 'Unknown') + 
                        ' | Page ' + String(i) + '/' + String(pageCount);
      pdf.text(footerText, margin, pageHeight - 10);
      pdf.text('DepositShield © ' + new Date().getFullYear(), pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * PDF Report Generation Functions
 * This file contains PDF generation functions for the DepositShield application reports.
 */

/**
 * Generates a PDF from the report detail page
 * @param {Object} report - Report data
 * @param {Array} photos - Report photos
 * @returns {Promise<jsPDF>} - the generated PDF
 */
export const generateReportPDF = async (report, photos = []) => {
  try {
    // Dynamically import jsPDF module
    const { jsPDF } = await import('jspdf');
    
    // Note: if jspdf-autotable module is missing, install it first
    // npm install jspdf-autotable
    // Let's comment this out for now
     await import('jspdf-autotable');
    
    // Custom font for special characters
    // Note: Using Roboto which supports most characters
    const fontURL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
    const fontData = await fetch(fontURL).then(res => res.arrayBuffer());
    
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Add font - for proper character display
    pdf.addFont(fontData, 'Roboto', 'normal');
    pdf.addFont(fontData, 'Roboto', 'bold');
    
    // PDF settings
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const titleFontSize = 18;
    const subtitleFontSize = 14;
    const sectionTitleFontSize = 12;
    const normalFontSize = 10;
    const smallFontSize = 8;
    const lineHeight = 7;
    let yPosition = margin;
    
    // Corporate colors for PDF
    const brandPrimary = [59, 130, 246]; // Indigo
    const brandSecondary = [30, 64, 175]; // Dark blue
    const textPrimary = [33, 33, 33]; // Dark gray
    const textSecondary = [107, 114, 128]; // Medium gray
    const borderColor = [229, 231, 235]; // Light gray
    const bgColor = [249, 250, 251]; // Very light gray
    const successColor = [16, 185, 129]; // Green
    const dangerColor = [239, 68, 68]; // Red
    
    // Header area - Logo section
    pdf.setFillColor(...bgColor);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    // Logo (as brand name)
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(...brandPrimary);
    pdf.text('DepositShield', margin, 20);
    
    // Small slogan
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(smallFontSize);
    pdf.setTextColor(...textSecondary);
    pdf.text('Property Reporting System', margin, 25);
    
    // Line between header and content
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 32, pageWidth - margin, 32);
    
    // Page title
    yPosition = 40;
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(...textPrimary);
    const reportTitle = `Property Report: ${report.title}`;
    pdf.text(reportTitle, margin, yPosition);
    yPosition += 10;
    
    // Report type
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(subtitleFontSize);
    pdf.setTextColor(...brandSecondary);
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
    yPosition += 10;
    
    // Info box - Report summary
    pdf.setFillColor(...bgColor);
    pdf.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
    
    // Address information
    yPosition += 8;
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(sectionTitleFontSize);
    pdf.setTextColor(...textPrimary);
    pdf.text('Property Address:', margin + 5, yPosition);
    
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(normalFontSize);
    yPosition += 7;
    pdf.text(report.address, margin + 5, yPosition);
    
    // Report date
    yPosition += 10;
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(sectionTitleFontSize);
    pdf.text('Report Date:', margin + 5, yPosition);
    
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(normalFontSize);
    yPosition += 7;
    const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(formattedDate, margin + 5, yPosition);
    
    yPosition += 15;
    
    // Approval status
    if (report.approval_status) {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      pdf.setDrawColor(...borderColor);
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'S');
      
      yPosition += 8;
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(normalFontSize);
      
      if (report.approval_status === 'approved') {
        pdf.setTextColor(...successColor);
        pdf.text('APPROVED BY LANDLORD', margin + 5, yPosition);
      } else if (report.approval_status === 'rejected') {
        pdf.setTextColor(...dangerColor);
        pdf.text('REJECTED BY LANDLORD', margin + 5, yPosition);
        
        // Rejection reason
        if (report.rejection_message) {
          yPosition += 7;
          pdf.setFont('Roboto', 'normal');
          pdf.setFontSize(smallFontSize);
          pdf.setTextColor(...dangerColor);
          
          // Long text processing for rejection reason
          const maxWidth = contentWidth - 10;
          const splitText = pdf.splitTextToSize('Rejection Reason: ' + report.rejection_message, maxWidth);
          pdf.text(splitText, margin + 5, yPosition);
        }
      }
      
      yPosition += 20;
    }
    
    // Tenant/Creator information
    if (report.tenant_name || report.tenant_email || report.creator_name) {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
      pdf.setDrawColor(...borderColor);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'S');
      
      yPosition += 8;
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(normalFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text('Tenant Information:', margin + 5, yPosition);
      
      pdf.setFont('Roboto', 'normal');
      yPosition += 7;
      
      if (report.tenant_name) {
        pdf.text(`Name: ${report.tenant_name}`, margin + 5, yPosition);
        yPosition += 7;
      } else if (report.creator_name) {
        pdf.text(`Name: ${report.creator_name}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      if (report.tenant_email) {
        pdf.text(`Email: ${report.tenant_email}`, margin + 5, yPosition);
        yPosition += 7;
      }
      
      yPosition += 10;
    }
    
    // Report description
    if (report.description) {
      // Title section
      pdf.setFillColor(...bgColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(sectionTitleFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text('Report Description', margin + 5, yPosition + 7);
      
      yPosition += 15;
      
      // Content section
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(normalFontSize);
      pdf.setTextColor(...textPrimary);
      
      // Long description text processing
      const maxWidth = contentWidth - 10;
      const splitText = pdf.splitTextToSize(report.description, maxWidth);
      pdf.text(splitText, margin + 5, yPosition);
      
      yPosition += splitText.length * 7 + 10;
    }
    
    // Photos section
    if (photos.length > 0) {
      // If we're near the end of the page, start a new one
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin + 10;
        
        // Add header to new page
        pdf.setFillColor(...bgColor);
        pdf.rect(margin, margin, contentWidth, 10, 'F');
      }
      
      // Title
      pdf.setFillColor(...bgColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(sectionTitleFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text(`Photos (${photos.length})`, margin + 5, yPosition + 7);
      
      yPosition += 15;
      
      // Show a limited number of photos (max 4)
      const photosToShow = Math.min(photos.length, 4);
      
      if (photosToShow > 0) {
        pdf.setFont('Roboto', 'italic');
        pdf.setFontSize(smallFontSize);
        pdf.setTextColor(...textSecondary);
        pdf.text('* All photos can be viewed in the online report.', margin + 5, yPosition);
        yPosition += 10;
        
        // Group photos by room
        const photosByRoom = {};
        photos.forEach(photo => {
          if (photo.tags && photo.tags.length > 0) {
            // Use first tag as the room
            const roomTag = photo.tags[0];
            if (!photosByRoom[roomTag]) {
              photosByRoom[roomTag] = [];
            }
            photosByRoom[roomTag].push(photo);
          }
        });
        
        // Display rooms and photo counts
        Object.entries(photosByRoom).forEach(([roomName, roomPhotos], index) => {
          if (index >= 2) return; // Show only the first 2 rooms
          
          pdf.setFont('Roboto', 'bold');
          pdf.setFontSize(normalFontSize);
          pdf.setTextColor(...brandSecondary);
          pdf.text(`${roomName} (${roomPhotos.length} photos)`, margin + 5, yPosition);
          
          yPosition += 7;
          
          // Show description of first 2 photos in the room
          roomPhotos.slice(0, 2).forEach(photo => {
            if (photo.note) {
              pdf.setFont('Roboto', 'normal');
              pdf.setFontSize(smallFontSize);
              pdf.setTextColor(...textPrimary);
              pdf.text(`- ${photo.note}`, margin + 10, yPosition);
              yPosition += 5;
            }
          });
          
          yPosition += 5;
        });
      }
    }
    
    // Footer - Add to each page
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Bottom line
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Footer text
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...textSecondary);
      pdf.text(`Report ID: ${report.id} | Page ${i}/${pageCount} | Generated on ${new Date().toLocaleDateString('en-US')}`, margin, pageHeight - 15);
      
      // Company name
      pdf.setFont('Roboto', 'bold');
      pdf.text('DepositShield Report System', pageWidth - margin - 45, pageHeight - 15, { align: 'right' });
    }

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
  try {
    // Dynamically import jsPDF module
    const { jsPDF } = await import('jspdf');
    
    // Note: jspdf-autotable module needs to be installed
    // npm install jspdf-autotable
    // Let's comment this out for now
    await import('jspdf-autotable');
    
    // Custom font for special characters
    const fontURL = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
    const fontData = await fetch(fontURL).then(res => res.arrayBuffer());
    
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Add font - for proper character display
    pdf.addFont(fontData, 'Roboto', 'normal');
    pdf.addFont(fontData, 'Roboto', 'bold');
    
    // PDF settings
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    const titleFontSize = 18;
    const subtitleFontSize = 14;
    const sectionTitleFontSize = 12;
    const normalFontSize = 10;
    const smallFontSize = 8;
    const lineHeight = 7;
    let yPosition = margin;
    
    // Corporate colors for PDF
    const brandPrimary = [59, 130, 246]; // Indigo
    const brandSecondary = [30, 64, 175]; // Dark blue
    const textPrimary = [33, 33, 33]; // Dark gray
    const textSecondary = [107, 114, 128]; // Medium gray
    const borderColor = [229, 231, 235]; // Light gray
    const bgColor = [249, 250, 251]; // Very light gray
    const successColor = [16, 185, 129]; // Green
    const dangerColor = [239, 68, 68]; // Red
    
    // Cover Page
    // Header area - Logo section
    pdf.setFillColor(...bgColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo (as brand name)
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(...brandPrimary);
    pdf.text('DepositShield', margin, 25);
    
    // Small slogan
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(smallFontSize + 2);
    pdf.setTextColor(...textSecondary);
    pdf.text('Property Reporting System', margin, 32);
    
    // Report Title - Cover page
    yPosition = 80;
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(titleFontSize + 6);
    pdf.setTextColor(...textPrimary);
    const reportTitle = `PROPERTY INSPECTION REPORT`;
    const titleWidth = pdf.getTextWidth(reportTitle);
    pdf.text(reportTitle, (pageWidth - titleWidth) / 2, yPosition);
    
    // Report type
    yPosition += 15;
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(subtitleFontSize);
    pdf.setTextColor(...brandSecondary);
    let reportTypeLabel = 'General Observation';
    
    switch(report.type) {
      case 'move-in':
        reportTypeLabel = 'Pre-Move-In Report';
        break;
      case 'move-out':
        reportTypeLabel = 'Post-Move-Out Report';
        break;
    }
    
    const typeWidth = pdf.getTextWidth(reportTypeLabel);
    pdf.text(reportTypeLabel, (pageWidth - typeWidth) / 2, yPosition);
    
    // Report details
    yPosition += 30;
    
    // Address detail - centered
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(sectionTitleFontSize);
    pdf.setTextColor(...textPrimary);
    const addressLabel = 'Property Address';
    const addressLabelWidth = pdf.getTextWidth(addressLabel);
    pdf.text(addressLabel, (pageWidth - addressLabelWidth) / 2, yPosition);
    
    yPosition += 10;
    
    // Address value - centered and boxed
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...borderColor);
    
    // Address text
    const address = report.address || 'Address not available';
    const addressLines = pdf.splitTextToSize(address, contentWidth - 20);
    const addressBoxHeight = 10 + addressLines.length * 7;
    
    // Address box
    pdf.roundedRect((pageWidth - contentWidth) / 2, yPosition, contentWidth, addressBoxHeight, 3, 3, 'FD');
    
    // Write address text
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(normalFontSize);
    yPosition += 7;
    
    // Center each line of address
    addressLines.forEach(line => {
      const lineWidth = pdf.getTextWidth(line);
      pdf.text(line, (pageWidth - lineWidth) / 2, yPosition);
      yPosition += 7;
    });
    
    yPosition += 15;
    
    // Report information table
    const tableData = [
      ['Report ID:', report.id || report.uuid || 'Unknown'],
      ['Report Date:', new Date(report.created_at).toLocaleDateString('en-US')],
      ['Created By:', report.creator_name || report.tenant_name || 'Unknown'],
      ['Report Type:', reportTypeLabel]
    ];
    
    if (report.approval_status || localApprovalStatus) {
      const status = report.approval_status || localApprovalStatus;
      let statusText = status === 'approved' ? 'Approved' : 'Rejected';
      tableData.push(['Approval Status:', statusText]);
    }
    
    // We'll draw the table manually (without autoTable)
    const tableWidth = 120;
    const tableX = (pageWidth - tableWidth) / 2;
    const rowHeight = 10;
    const colWidth1 = 40;
    const colWidth2 = tableWidth - colWidth1;
    
    // Draw table background
    pdf.setFillColor(250, 250, 250);
    pdf.rect(tableX, yPosition, tableWidth, tableData.length * rowHeight, 'F');
    
    // Add rows
    pdf.setDrawColor(...borderColor);
    pdf.setLineWidth(0.1);
    
    for (let i = 0; i < tableData.length; i++) {
      const y = yPosition + (i * rowHeight);
      
      // Cell background
      if (i % 2 === 0) {
        pdf.setFillColor(245, 247, 250);
        pdf.rect(tableX, y, tableWidth, rowHeight, 'F');
      }
      
      // Line
      pdf.line(tableX, y, tableX + tableWidth, y);
      
      // Column separator
      pdf.line(tableX + colWidth1, y, tableX + colWidth1, y + rowHeight);
      
      // First column (title)
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...textPrimary);
      pdf.text(tableData[i][0], tableX + 3, y + 7);
      
      // Second column (value)
      pdf.setFont('Roboto', 'normal');
      pdf.text(tableData[i][1], tableX + colWidth1 + 3, y + 7);
    }
    
    // Last line
    pdf.line(tableX, yPosition + (tableData.length * rowHeight), tableX + tableWidth, yPosition + (tableData.length * rowHeight));
    // Outer border
    pdf.rect(tableX, yPosition, tableWidth, tableData.length * rowHeight, 'S');
    
    // Update Y position
    yPosition = yPosition + (tableData.length * rowHeight) + 20;
    
    // Footer (logo and date)
    pdf.setFont('Roboto', 'italic');
    pdf.setFontSize(smallFontSize);
    pdf.setTextColor(...textSecondary);
    const footerText = 'This report was generated by DepositShield';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 20);
    
    const dateText = `Generation Date: ${new Date().toLocaleDateString('en-US')}`;
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, (pageWidth - dateWidth) / 2, pageHeight - 15);
    
    // Content Page
    pdf.addPage();
    
    // Page header
    pdf.setFillColor(...bgColor);
    pdf.rect(0, 0, pageWidth, 20, 'F');
    
    // Logo (smaller)
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...brandPrimary);
    pdf.text('DepositShield', margin, 13);
    
    // Report name (right)
    pdf.setFont('Roboto', 'normal');
    pdf.setFontSize(smallFontSize);
    pdf.setTextColor(...textSecondary);
    const headerText = 'Property Inspection Report';
    pdf.text(headerText, pageWidth - margin - pdf.getTextWidth(headerText), 13);
    
    yPosition = 30;
    
    // Content title
    pdf.setFont('Roboto', 'bold');
    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(...textPrimary);
    pdf.text('Report Details', margin, yPosition);
    yPosition += 10;
    
    // Approval status (if any)
    if (report.approval_status || localApprovalStatus) {
      const actualStatus = report.approval_status || localApprovalStatus;
      
      // Status box
      pdf.setFillColor(actualStatus === 'approved' ? [240, 253, 244] : [254, 242, 242]);
      pdf.rect(margin, yPosition, contentWidth, 15, 'F');
      
      // Status text
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(normalFontSize);
      pdf.setTextColor(actualStatus === 'approved' ? [...successColor] : [...dangerColor]);
      
      const statusText = actualStatus === 'approved' ? 'APPROVED BY LANDLORD' : 'REJECTED BY LANDLORD';
      pdf.text(statusText, margin + 5, yPosition + 9);
      
      yPosition += 20;
      
      // Rejection reason
      if (actualStatus === 'rejected' && report.rejection_message) {
        pdf.setFillColor(254, 242, 242, 0.5); // Light red background
        pdf.rect(margin, yPosition, contentWidth, 20, 'F');
        
        pdf.setFont('Roboto', 'bold');
        pdf.setFontSize(smallFontSize);
        pdf.setTextColor(...dangerColor);
        pdf.text('Rejection Reason:', margin + 5, yPosition + 7);
        
        pdf.setFont('Roboto', 'normal');
        const splitReason = pdf.splitTextToSize(report.rejection_message, contentWidth - 10);
        pdf.text(splitReason, margin + 5, yPosition + 14);
        
        yPosition += 25;
      }
    }
    
    // Description
    if (report.description) {
      pdf.setFillColor(...bgColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(sectionTitleFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text('Report Description', margin + 5, yPosition + 7);
      
      yPosition += 15;
      
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(normalFontSize);
      pdf.setTextColor(...textPrimary);
      
      const descriptionText = pdf.splitTextToSize(report.description, contentWidth - 10);
      pdf.text(descriptionText, margin + 5, yPosition);
      
      yPosition += descriptionText.length * 7 + 10;
    }
    
    // Tenant information
    if (report.tenant_name || report.tenant_email || report.creator_name || report.creator_email) {
      // Check if we need to move to a new page
      if (yPosition > pageHeight - 70) {
        pdf.addPage();
        
        // Page header
        pdf.setFillColor(...bgColor);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        
        pdf.setFont('Roboto', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(...brandPrimary);
        pdf.text('DepositShield', margin, 13);
        
        pdf.setFont('Roboto', 'normal');
        pdf.setFontSize(smallFontSize);
        pdf.setTextColor(...textSecondary);
        pdf.text(headerText, pageWidth - margin - pdf.getTextWidth(headerText), 13);
        
        yPosition = 30;
      }
      
      pdf.setFillColor(...bgColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(sectionTitleFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text('Tenant/Creator Information', margin + 5, yPosition + 7);
      
      yPosition += 15;
      
      // Information table
      const tenantData = [];
      
      if (report.tenant_name || report.creator_name) {
        tenantData.push(['Name:', report.tenant_name || report.creator_name]);
      }
      
      if (report.tenant_email || report.creator_email) {
        tenantData.push(['Email:', report.tenant_email || report.creator_email]);
      }
      
      if (report.tenant_phone || report.creator_phone) {
        tenantData.push(['Phone:', report.tenant_phone || report.creator_phone]);
      }
      
      if (report.role_at_this_property) {
        const roleLabels = {
          'landlord': 'Landlord',
          'renter': 'Tenant',
          'agent': 'Agent'
        };
        tenantData.push(['Role:', roleLabels[report.role_at_this_property] || report.role_at_this_property]);
      }
      
      // Draw tenant information table
      const rowHeight = 10;
      const colWidth1 = 40;
      const colWidth2 = contentWidth - colWidth1;
      
      // Table background
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition, contentWidth, tenantData.length * rowHeight, 'F');
      
      // Add rows
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.1);
      
      for (let i = 0; i < tenantData.length; i++) {
        const y = yPosition + (i * rowHeight);
        
        // Cell background
        if (i % 2 === 0) {
          pdf.setFillColor(245, 247, 250);
          pdf.rect(margin, y, contentWidth, rowHeight, 'F');
        }
        
        // Line
        pdf.line(margin, y, margin + contentWidth, y);
        
        // Column separator
        pdf.line(margin + colWidth1, y, margin + colWidth1, y + rowHeight);
        
        // First column (title)
        pdf.setFont('Roboto', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(...textPrimary);
        pdf.text(tenantData[i][0], margin + 3, y + 7);
        
        // Second column (value)
        pdf.setFont('Roboto', 'normal');
        pdf.text(tenantData[i][1], margin + colWidth1 + 3, y + 7);
      }
      
      // Last line
      pdf.line(margin, yPosition + (tenantData.length * rowHeight), margin + contentWidth, yPosition + (tenantData.length * rowHeight));
      
      // Outer border
      pdf.rect(margin, yPosition, contentWidth, tenantData.length * rowHeight, 'S');
      
      // Update Y position
      yPosition = yPosition + (tenantData.length * rowHeight) + 15;
    }
    
    // Photos section
    if (photos.length > 0) {
      // Check if we need to move to a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        
        // Page header
        pdf.setFillColor(...bgColor);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        
        pdf.setFont('Roboto', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(...brandPrimary);
        pdf.text('DepositShield', margin, 13);
        
        pdf.setFont('Roboto', 'normal');
        pdf.setFontSize(smallFontSize);
        pdf.setTextColor(...textSecondary);
        pdf.text(headerText, pageWidth - margin - pdf.getTextWidth(headerText), 13);
        
        yPosition = 30;
      }
      
      pdf.setFillColor(...bgColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      
      pdf.setFont('Roboto', 'bold');
      pdf.setFontSize(sectionTitleFontSize);
      pdf.setTextColor(...textPrimary);
      pdf.text(`Photos (${photos.length})`, margin + 5, yPosition + 7);
      
      yPosition += 15;
      
      // Photo summary
      pdf.setFont('Roboto', 'italic');
      pdf.setFontSize(smallFontSize);
      pdf.setTextColor(...textSecondary);
      pdf.text('* All photos can be viewed in the online report (depositshield.retako.com)', margin + 5, yPosition);
      
      yPosition += 10;
      
      // Photo examples - show the 3 rooms with most photos
      const photosByRoom = {};
      photos.forEach(photo => {
        if (photo.tags && photo.tags.length > 0) {
          const roomTag = photo.tags[0];
          if (!photosByRoom[roomTag]) {
            photosByRoom[roomTag] = [];
          }
          photosByRoom[roomTag].push(photo);
        }
      });
      
      // Sort rooms by photo count
      const sortedRooms = Object.entries(photosByRoom)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3); // Show at most 3 rooms
        
      // List the rooms
      const roomData = sortedRooms.map(([roomName, roomPhotos]) => [
        roomName,
        `${roomPhotos.length} photos`,
        roomPhotos[0]?.note || 'No description'
      ]);
      
      if (roomData.length > 0) {
        // Table header row
        const headerRow = ['Room', 'Photo Count', 'Sample Description'];
        
        // Table settings
        const rowHeight = 12;
        const colWidth1 = contentWidth * 0.35; // Room - 35%
        const colWidth2 = contentWidth * 0.25; // Photo count - 25%
        const colWidth3 = contentWidth * 0.4;  // Description - 40%
        
        // Header row
        pdf.setFillColor(...brandPrimary);
        pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F');
        
        // Header text
        pdf.setFont('Roboto', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255); // White text
        
        // Write headers
        pdf.text(headerRow[0], margin + 3, yPosition + 8);
        pdf.text(headerRow[1], margin + colWidth1 + 3, yPosition + 8);
        pdf.text(headerRow[2], margin + colWidth1 + colWidth2 + 3, yPosition + 8);
        
        // Lines
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.1);
        
        // Column dividers
        pdf.line(margin + colWidth1, yPosition, margin + colWidth1, yPosition + rowHeight);
        pdf.line(margin + colWidth1 + colWidth2, yPosition, margin + colWidth1 + colWidth2, yPosition + rowHeight);
        
        // Data rows
        yPosition += rowHeight;
        
        for (let i = 0; i < roomData.length; i++) {
          // Background - for striped design
          pdf.setFillColor(i % 2 === 0 ? 245 : 255, i % 2 === 0 ? 247 : 255, i % 2 === 0 ? 250 : 255);
          pdf.rect(margin, yPosition, contentWidth, rowHeight, 'F');
          
          pdf.setFont('Roboto', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(...textPrimary);
          
          // Write cell data
          pdf.text(roomData[i][0], margin + 3, yPosition + 8); // Room
          pdf.text(roomData[i][1], margin + colWidth1 + 3, yPosition + 8); // Count
          
          // Description - may be long, check
          const description = roomData[i][2];
          if (description.length > 25) {
            // Truncate
            pdf.text(description.substring(0, 22) + '...', margin + colWidth1 + colWidth2 + 3, yPosition + 8);
          } else {
            pdf.text(description, margin + colWidth1 + colWidth2 + 3, yPosition + 8);
          }
          
          // Column lines
          pdf.line(margin + colWidth1, yPosition, margin + colWidth1, yPosition + rowHeight);
          pdf.line(margin + colWidth1 + colWidth2, yPosition, margin + colWidth1 + colWidth2, yPosition + rowHeight);
          
          // Next row
          yPosition += rowHeight;
          
          // Row line
          pdf.line(margin, yPosition, margin + contentWidth, yPosition);
        }
        
        // Outer border
        pdf.rect(margin, yPosition - (roomData.length * rowHeight) - rowHeight, contentWidth, (roomData.length + 1) * rowHeight, 'S');
        
        // Update Y position
        yPosition += 10;
      } else {
        pdf.setFont('Roboto', 'normal');
        pdf.setFontSize(normalFontSize);
        pdf.setTextColor(...textPrimary);
        pdf.text('Photos are not tagged or grouped by room.', margin + 5, yPosition);
        yPosition += 10;
      }
    }
    
    // Alt bilgi - Her sayfaya ekle
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Alt çizgi (ilk sayfa hariç)
      if (i > 1) {
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      }
      
      // Alt bilgi metni
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(...textSecondary);
      
      if (i > 1) { // İlk sayfa farklı alt bilgi
        pdf.text(`Rapor No: ${report.id || report.uuid || 'Bilinmiyor'} | Sayfa ${i}/${pageCount}`, margin, pageHeight - 10);
        pdf.text('DepositShield © ' + new Date().getFullYear(), pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

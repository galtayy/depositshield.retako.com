/**
 * Adds font support to a PDF document
 * @param {jsPDF} pdf - PDF document instance
 * @returns {Promise<void>}
 */
export const addTurkishFontSupport = async (pdf) => {
  try {
    console.log('Adding custom font support for extended characters');
    
    // Add Noto Sans for good character coverage
    // Noto Sans is a free Google font that supports many languages and characters
    const notoSansUrl = 'https://fonts.gstatic.com/s/notosans/v14/o-0IIpQlx3QUlC5A4PNr5TRA.woff2';
    const notoSansBoldUrl = 'https://fonts.gstatic.com/s/notosans/v14/o-0NIpQlx3QUlC5A4PNjXhFVatyB.woff2';
    
    try {
      // Download fonts
      const regularFontResponse = await fetch(notoSansUrl);
      const boldFontResponse = await fetch(notoSansBoldUrl);
      
      if (regularFontResponse.ok && boldFontResponse.ok) {
        const regularFontData = await regularFontResponse.arrayBuffer();
        const boldFontData = await boldFontResponse.arrayBuffer();
        
        // Add fonts
        pdf.addFont(regularFontData, 'NotoSans', 'normal');
        pdf.addFont(boldFontData, 'NotoSans', 'bold');
        
        // Set as default font
        pdf.setFont('NotoSans', 'normal');
        
        console.log('Extended character font support added successfully');
      } else {
        throw new Error('Font files could not be fetched');
      }
    } catch (fetchError) {
      console.error('Error fetching font files:', fetchError);
      
      // Fallback: Try Open Sans
      try {
        const openSansUrl = 'https://fonts.gstatic.com/s/opensans/v23/mem8YaGs126MiZpBA-UFVZ0b.woff2';
        const openSansBoldUrl = 'https://fonts.gstatic.com/s/opensans/v23/mem5YaGs126MiZpBA-UN7rgOUuhp.woff2';
        
        const osRegularResponse = await fetch(openSansUrl);
        const osBoldResponse = await fetch(openSansBoldUrl);
        
        if (osRegularResponse.ok && osBoldResponse.ok) {
          const osRegularData = await osRegularResponse.arrayBuffer();
          const osBoldData = await osBoldResponse.arrayBuffer();
          
          pdf.addFont(osRegularData, 'OpenSans', 'normal');
          pdf.addFont(osBoldData, 'OpenSans', 'bold');
          
          pdf.setFont('OpenSans', 'normal');
          console.log('Fallback font support added (OpenSans)');
        } else {
          throw new Error('Fallback font files could not be fetched');
        }
      } catch (fallbackError) {
        console.error('Error fetching fallback fonts:', fallbackError);
        // Last resort: use helvetica
        pdf.setFont('helvetica', 'normal');
      }
    }
    
    return pdf;
  } catch (fontError) {
    console.error('Error adding font support:', fontError);
    // On error, continue with default font
    pdf.setFont('helvetica', 'normal');
    return pdf;
  }
};

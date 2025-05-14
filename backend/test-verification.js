// Script to test verification functionality
const verificationService = require('./services/verification.service');
const db = require('./config/database');

async function testVerification() {
  try {
    console.log('Testing verification service...');
    
    // User ID to test with
    const userId = 2;
    
    // Get user info first
    const [userRows] = await db.execute('SELECT id, email, verification_code, verification_expires FROM users WHERE id = ?', [userId]);
    
    if (userRows.length === 0) {
      console.log(`User with ID ${userId} not found.`);
      return;
    }
    
    const user = userRows[0];
    console.log('Current user state:', user);
    
    // Reset verification for testing
    const resetResult = await verificationService.resetVerificationForUser(userId);
    console.log('Reset verification result:', resetResult);
    
    // Get updated user state
    const [updatedUserRows] = await db.execute('SELECT id, email, verification_code, verification_expires FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedUserRows[0];
    console.log('Updated user state:', updatedUser);
    
    // Try to verify with the new code
    const verifyResult = await verificationService.verifyUser(userId, resetResult.code);
    console.log('Verification result:', verifyResult);
    
    // Check final state
    const [finalUserRows] = await db.execute('SELECT id, email, verification_code, verification_expires, is_verified FROM users WHERE id = ?', [userId]);
    const finalUser = finalUserRows[0];
    console.log('Final user state:', finalUser);
    
    console.log('Testing completed successfully.');
  } catch (error) {
    console.error('Error during verification test:', error);
  } finally {
    await db.end();
    console.log('Database connection closed.');
  }
}

// Run the function
testVerification();
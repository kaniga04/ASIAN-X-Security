require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    // Remove synthetic training samples
    const result = await User.updateOne(
        { email: 'testcase@gmail.com' },
        { $pull: { 'behavioralProfile.keystrokeSignatures': { deviceId: 'training-device' } } }
    );
    console.log('Removed synthetic samples:', result.modifiedCount);
    
    // Clear DNA and ML models so they retrain from real data
    await User.updateOne(
        { email: 'testcase@gmail.com' },
        { $unset: { 'behavioralProfile.dnaModel': '', 'behavioralProfile.mlModel': '' } }
    );
    
    console.log('✅ Cleaned - Ready for real training');
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
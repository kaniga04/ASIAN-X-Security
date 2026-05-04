require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    const result = await User.updateOne(
        { email: 'testcase@gmail.com' },
        { 
            $set: { 
                'behavioralProfile.keystrokeSignatures': [],
                'behavioralProfile.baselineProfile': {},
                'behavioralProfile.mlModel': null,
                'behavioralProfile.dnaModel': null
            } 
        }
    );
    
    console.log('✅ ALL data cleaned');
    await mongoose.disconnect();
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
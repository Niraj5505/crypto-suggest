import mongoose from 'mongoose';
const MONGO_URI = 'mongodb+srv://zarwebcoders:zarwebcoders@ac-3l1aapn.lqgakzj.mongodb.net/cryptosuggest';

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const categories = db.collection('categories');

    // Mark MLM as featured so it shows in category grid
    const result = await categories.updateOne(
        { slug: 'mlm' },
        { $set: { featured: true } }
    );

    if (result.matchedCount === 0) {
        console.log('❌ MLM category not found by slug. Trying by name...');
        const byName = await categories.updateOne(
            { name: /mlm/i },
            { $set: { featured: true } }
        );
        console.log('Update by name:', byName.modifiedCount, 'modified');
    } else {
        console.log('✅ MLM category set to featured:', result.modifiedCount, 'modified');
    }

    // Also list all categories to debug
    const all = await categories.find({}).toArray();
    console.log('\n📋 All categories:');
    all.forEach(c => {
        console.log(`  - ${c.name} (slug: ${c.slug}) | featured: ${c.featured}`);
    });

    await mongoose.disconnect();
    console.log('\n👋 Done');
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

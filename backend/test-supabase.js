// Simple test to check if Supabase is working
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function testSupabase() {
    console.log("Testing Supabase setup...\n");

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log("❌ Missing Supabase credentials in .env file");
        console.log("Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env");
        return;
    }

    console.log("✅ Environment variables found");
    console.log(`URL: ${process.env.SUPABASE_URL}`);
    console.log(`Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...\n`);

    try {
        const supabase = require("./config/supabase");
        
        console.log("✅ Connected to Supabase\n");

        // Try to list buckets (may fail due to permissions)
        console.log("📦 Attempting to list buckets...");
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.log("⚠️  Cannot list buckets (this is normal with anon key)");
            console.log(`   Error: ${listError.message}\n`);
        } else if (buckets && buckets.length > 0) {
            console.log("   Available buckets:");
            buckets.forEach(bucket => {
                console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
            });
            console.log("");
        } else {
            console.log("   (no buckets found)\n");
        }

        // Test direct bucket access by trying to list files
        console.log("🔍 Testing 'seed-attachments' bucket access...");
        const { data: files, error: filesError } = await supabase.storage
            .from('seed-attachments')
            .list('', { limit: 1 });

        if (filesError) {
            if (filesError.message.includes('not found') || filesError.message.includes('does not exist')) {
                console.log("❌ Bucket 'seed-attachments' does not exist");
                console.log("\n📝 Please create it manually:");
                console.log("1. Go to your Supabase dashboard");
                console.log("2. Click 'Storage' in the left sidebar");
                console.log("3. Click 'Create a new bucket'");
                console.log("4. Name it exactly: seed-attachments");
                console.log("5. Make sure 'Public bucket' is checked");
                console.log("6. Click 'Create bucket'");
            } else {
                console.log(`❌ Error accessing bucket: ${filesError.message}`);
                console.log("\n📝 Make sure the bucket has the correct permissions:");
                console.log("1. Go to your Supabase dashboard");
                console.log("2. Click 'Storage' in the left sidebar");
                console.log("3. Find 'seed-attachments' bucket");
                console.log("4. Make sure 'Public bucket' is checked");
            }
            return;
        }

        console.log("✅ 'seed-attachments' bucket is accessible!");
        console.log(`   Current files: ${files.length}`);

        // Try a test upload
        console.log("\n📤 Testing file upload...");
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = 'This is a test file';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('seed-attachments')
            .upload(testFileName, testContent, {
                contentType: 'text/plain',
                upsert: false
            });

        if (uploadError) {
            console.log(`❌ Upload failed: ${uploadError.message}`);
            console.log("\n📝 You may need to add storage policies:");
            console.log("1. Go to your Supabase dashboard");
            console.log("2. Click 'Storage' in the left sidebar");
            console.log("3. Click on 'seed-attachments' bucket");
            console.log("4. Go to 'Policies' tab");
            console.log("5. Add policies for INSERT, SELECT, UPDATE, DELETE operations");
            return;
        }

        console.log("✅ Upload successful!");
        console.log(`   File path: ${uploadData.path}`);

        // Clean up test file
        console.log("\n🧹 Cleaning up test file...");
        const { error: deleteError } = await supabase.storage
            .from('seed-attachments')
            .remove([testFileName]);

        if (deleteError) {
            console.log(`⚠️  Could not delete test file: ${deleteError.message}`);
        } else {
            console.log("✅ Test file cleaned up");
        }

        console.log("\n🎉 Everything is set up correctly! Run 'npm run dev' to start.");

    } catch (error) {
        console.log("❌ Error:", error.message);
    }
}

testSupabase();

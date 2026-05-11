const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js'); // استدعاء مكتبة قاعدة البيانات
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();

// إعدادات CORS للسماح بالاتصال من واجهة React
app.use(cors());
app.use(express.json());

// 1. إعداد قاعدة بيانات Supabase (يقرأ من ملف .env)
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

// 2. إعداد Cloudinary (يأخذ البيانات من ملف .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. إعداد Multer لتخزين الصور المرفوعة مؤقتاً
const upload = multer({ dest: 'uploads/' });

// التأكد من وجود مجلد uploads عند بدء تشغيل السيرفر
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ==========================================
// المسار الأول: الرفع السريع (لإضافة الفلاتر فقط) + حفظ في القاعدة
// ==========================================
app.post('/upload-only', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('لم يتم استلام أي صورة.');
    }

    try {
        console.log("--- Fast Track Started: Direct Upload to Cloudinary ---");
        
        // رفع الصورة مباشرة إلى السحابة
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "elevate_ai_direct",
            resource_type: "image"
        });

        // --- [ حفظ الرابط في Supabase مع إضافة التاريخ يدوياً لحل مشكلة الـ Null ] ---
        const { error: dbError } = await supabase
            .from('images')
            .insert([{ 
                url: uploadResult.secure_url,
                created_at: new Date().toISOString() // إرسال التاريخ بصيغة ISO
            }]);

        if (dbError) console.error("Supabase Save Error (Fast Track):", dbError.message);

        // حذف الملف المؤقت من السيرفر
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.log("--- Fast Track Finished: Success ---");

        res.json({ 
            message: "Success",
            result_url: uploadResult.secure_url 
        });

    } catch (error) {
        console.error("Fast Upload Error:", error.message);
        res.status(500).json({ error: "فشل الرفع السريع للصورة" });
    }
});

// ==========================================
// المسار الثاني: المعالجة العميقة بالذكاء الاصطناعي + حفظ في القاعدة
// ==========================================
app.post('/process-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('لم يتم اختيار صورة للمعالجة.');
    }

    const inputPath = req.file.path;

    try {
        console.log("--- Step 1: Sending image to AI Engine (Port 8080) ---");
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(inputPath));

        const aiResponse = await axios.post('http://localhost:8080/enhance', formData, {
            headers: { ...formData.getHeaders() },
            timeout: 600000 // 10 minutes timeout
        });

        if (aiResponse.data.status === "success") {
            console.log("--- Step 2: AI Restoration Complete ---");

            const resultPath = path.join(__dirname, '..', 'ai_engine', 'GFPGAN', aiResponse.data.file_path);

            console.log("--- Step 3: Uploading AI result to Cloudinary ---");
            
            const uploadResult = await cloudinary.uploader.upload(resultPath, {
                folder: "elevate_ai_results",
                resource_type: "image"
            });

            // --- [ حفظ الرابط في Supabase مع إضافة التاريخ يدوياً لحل مشكلة الـ Null ] ---
            const { error: dbError } = await supabase
                .from('images')
                .insert([{ 
                    url: uploadResult.secure_url,
                    created_at: new Date().toISOString() // إرسال التاريخ بصيغة ISO
                }]);

            if (dbError) console.error("Supabase Save Error (AI Track):", dbError.message);

            // تنظيف الملفات المؤقتة
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

            console.log("--- Step 4: Finished Successfully ---");

            res.json({ 
                message: "Success",
                result_url: uploadResult.secure_url 
            });

        } else {
            console.error("AI Server Error:", aiResponse.data.message);
            res.status(500).json({ error: "فشلت معالجة الذكاء الاصطناعي", details: aiResponse.data.message });
        }

    } catch (error) {
        console.error("Connection Error:", error.message);
        res.status(500).json({ 
            error: "فشل الاتصال بمحرك الذكاء الاصطناعي", 
            details: "تأكد من تشغيل ai_server.py على بورت 8080" 
        });
    }
});

// تشغيل السيرفر الرئيسي على بورت 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Node.js Luxury Server is running on port ${PORT}`);
    console.log(`Cloudinary & Supabase: Integrated ✅`);
    console.log(`Ready to process high-quality images...`);
});
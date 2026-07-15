import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { recognizeReceipt, recognizeGeneral } from './baidu-ocr';
import { parseReceipt, ParsedReceipt } from './parser';
import { exportToExcel } from './excel-export';
import {
  insertReceipt,
  getAllReceipts,
  deleteAllReceipts,
  getReceiptSummary,
  uploadImage,
  Receipt,
} from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// 临时目录用于处理上传（识别后删除）
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 JPG/PNG/BMP/WebP 格式'));
    }
  },
});

/**
 * POST /api/upload
 * 上传单张或多张票据图片，返回识别结果
 */
app.post('/api/upload', upload.array('receipts', 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: '请上传至少一张图片' });
    }

    const results: ParsedReceipt[] = [];

    for (const file of files) {
      const imagePath = file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      try {
        // 调用百度 AI 票据识别
        let ocrResult = await recognizeReceipt(imageBase64);

        // 如果票据识别失败，用通用文字识别兜底
        if (!ocrResult.words_result || ocrResult.words_result.length === 0) {
          ocrResult = await recognizeGeneral(imageBase64);
        }

        const parsed = parseReceipt(ocrResult, file.originalname);

        // 上传图片到 Supabase Storage
        let imageUrl: string | null = null;
        try {
          imageUrl = await uploadImage(file.originalname, imageBuffer);
        } catch (uploadError: any) {
          console.error(`图片上传失败 [${file.originalname}]:`, uploadError.message);
        }

        // 保存到数据库
        await insertReceipt({
          filename: parsed.filename,
          vendor: parsed.vendor,
          category: parsed.category,
          amount: parsed.amount,
          date: parsed.date,
          raw_text: parsed.rawText,
          confidence: parsed.confidence,
          image_url: imageUrl,
        });

        results.push({ ...parsed, imagePath: imageUrl || undefined });
      } catch (ocrError: any) {
        console.error(`识别失败 [${file.originalname}]:`, ocrError.message);

        // 即使识别失败也保存记录
        await insertReceipt({
          filename: file.originalname,
          vendor: null,
          category: '识别失败',
          amount: null,
          date: null,
          raw_text: `识别失败: ${ocrError.message}`,
          confidence: 'low',
          image_url: null,
        });

        results.push({
          filename: file.originalname,
          vendor: null,
          category: '识别失败',
          amount: null,
          date: null,
          rawText: `识别失败: ${ocrError.message}`,
          confidence: 'low',
        });
      } finally {
        // 删除本地临时文件
        try {
          fs.unlinkSync(imagePath);
        } catch (e) {
          console.error('删除临时文件失败:', e);
        }
      }
    }

    // 计算汇总
    const total = results.reduce((sum, r) => sum + (r.amount || 0), 0);
    const byCategory: Record<string, number> = {};
    results.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + (r.amount || 0);
    });

    res.json({
      success: true,
      receipts: results,
      summary: {
        count: results.length,
        total,
        byCategory,
      },
    });
  } catch (error: any) {
    console.error('上传处理失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/receipts
 * 获取所有已识别票据
 */
app.get('/api/receipts', async (req, res) => {
  try {
    const receipts = await getAllReceipts();
    const summary = await getReceiptSummary();

    // 转换数据库格式到 API 格式
    const mappedReceipts = receipts.map((r) => ({
      filename: r.filename,
      vendor: r.vendor,
      category: r.category,
      amount: r.amount ? Number(r.amount) : null,
      date: r.date,
      rawText: r.raw_text,
      confidence: r.confidence,
      imagePath: r.image_url,
    }));

    res.json({
      receipts: mappedReceipts,
      summary,
    });
  } catch (error: any) {
    console.error('获取票据失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/export
 * 导出 Excel
 */
app.get('/api/export', async (req, res) => {
  try {
    const receipts = await getAllReceipts();

    if (receipts.length === 0) {
      return res.status(400).json({ error: '没有可导出的票据' });
    }

    // 转换格式
    const parsedReceipts: ParsedReceipt[] = receipts.map((r) => ({
      filename: r.filename,
      vendor: r.vendor,
      category: r.category,
      amount: r.amount ? Number(r.amount) : null,
      date: r.date,
      rawText: r.raw_text,
      confidence: r.confidence,
      imagePath: r.image_url || undefined,
    }));

    const buffer = await exportToExcel(parsedReceipts);
    const filename = `报销汇总_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('导出失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/receipts
 * 清空所有票据
 */
app.delete('/api/receipts', async (req, res) => {
  try {
    await deleteAllReceipts();
    res.json({ success: true, message: '已清空' });
  } catch (error: any) {
    console.error('清空失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🧾 票据识别服务已启动: http://localhost:${PORT}\n`);
});

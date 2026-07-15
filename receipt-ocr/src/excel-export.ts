import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { ParsedReceipt } from './parser';

export async function exportToExcel(receipts: ParsedReceipt[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Receipt Tracker';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('报销汇总');

  // 表头
  sheet.columns = [
    { header: '序号', key: 'index', width: 8 },
    { header: '票据图片', key: 'image', width: 20 },
    { header: '日期', key: 'date', width: 14 },
    { header: '商户/来源', key: 'vendor', width: 22 },
    { header: '分类', key: 'category', width: 14 },
    { header: '金额(元)', key: 'amount', width: 14 },
    { header: '原文摘要', key: 'rawText', width: 40 },
  ];

  // 表头样式
  const headerRow = sheet.getRow(1);
  headerRow.height = 20;
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE7E3DA' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // 图片行高（像素转换为 Excel 行高 points，约 120px）
  const IMAGE_ROW_HEIGHT = 90;
  const IMAGE_COL_INDEX = 1; // B 列（0-based）

  // 数据行
  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    const rowNumber = i + 2; // 第 1 行是表头

    const row = sheet.addRow({
      index: i + 1,
      image: '',
      date: r.date || '未识别',
      vendor: r.vendor || '未识别',
      category: r.category,
      amount: r.amount ?? '待确认',
      rawText: r.rawText.substring(0, 80),
    });

    // 金额列右对齐
    row.getCell('amount').alignment = { horizontal: 'right' };
    row.alignment = { vertical: 'middle' };

    // 嵌入图片
    if (r.imagePath && fs.existsSync(r.imagePath)) {
      const ext = path.extname(r.imagePath).toLowerCase().replace('.', '');
      const mimeMap: Record<string, 'jpeg' | 'png' | 'gif'> = {
        jpg: 'jpeg',
        jpeg: 'jpeg',
        png: 'png',
        gif: 'gif',
      };
      const extension = mimeMap[ext] || 'jpeg';

      const imageId = workbook.addImage({
        buffer: fs.readFileSync(r.imagePath) as unknown as ExcelJS.Buffer,
        extension,
      });

      // 设置行高以容纳图片
      row.height = IMAGE_ROW_HEIGHT;

      sheet.addImage(imageId, {
        tl: { col: IMAGE_COL_INDEX, row: rowNumber - 1 },
        ext: { width: 120, height: 110 },
      });
    }
  }

  // 空行
  sheet.addRow({});

  // 合计行
  const total = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalRow = sheet.addRow({
    index: '',
    image: '',
    date: '',
    vendor: '',
    category: '合计',
    amount: total,
    rawText: `共 ${receipts.length} 张票据`,
  });
  totalRow.font = { bold: true, size: 11 };
  totalRow.getCell('amount').numFmt = '#,##0.00';

  // 分类小计
  sheet.addRow({});
  const categoryTotalRow = sheet.addRow({
    index: '',
    image: '',
    date: '',
    vendor: '',
    category: '分类小计',
    amount: '',
    rawText: '',
  });
  categoryTotalRow.font = { bold: true, size: 11 };

  const byCategory: Record<string, number> = {};
  receipts.forEach((r) => {
    byCategory[r.category] = (byCategory[r.category] || 0) + (r.amount || 0);
  });

  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      sheet.addRow({
        index: '',
        image: '',
        date: '',
        vendor: '',
        category: `  ${category}`,
        amount: amount,
        rawText: '',
      });
    });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, ExternalHyperlink, ImageRun
} from 'docx'

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const headerShading = { fill: '1F4E79', type: ShadingType.CLEAR }

function headerCell(text: string, width: number) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, shading: headerShading,
    margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: 'FFFFFF', font: 'Arial', size: 18 })] })]
  })
}

function dataCell(text: string, width: number, center = false, bold = false) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text, font: 'Arial', size: 18, bold })] })]
  })
}

function linkCell(text: string, url: string, width: number) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new ExternalHyperlink({ link: url, children: [new TextRun({ text, style: 'Hyperlink', font: 'Arial', size: 16 })] })] })]
  })
}

function screenshotPlaceholder(label: string) {
  return new Paragraph({
    spacing: { before: 60, after: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
    children: [new TextRun({ text: `【スクリーンショット挿入予定：${label}】`, font: 'Arial', size: 18, color: 'AAAAAA', italics: true })]
  })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const title = formData.get('title') as string
  const country = formData.get('country') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const sitesJson = formData.get('sites') as string
  const sites = JSON.parse(sitesJson || '[]')
  const screenshot1 = formData.get('screenshot1') as File | null
  const screenshot2 = formData.get('screenshot2') as File | null
  const screenshot3 = formData.get('screenshot3') as File | null

  const colWidths = [500, 1800, 3500, 1500, 2060]

  async function makeScreenshotParagraph(file: File | null, label: string) {
    if (!file) return screenshotPlaceholder(label)
    const buf = await file.arrayBuffer()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
   const typeMap: Record<string, 'png'|'jpg'|'gif'|'bmp'> = { png: 'png', jpg: 'jpg', jpeg: 'jpg', gif: 'gif', bmp: 'bmp' }
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 200 },
      children: [new ImageRun({ data: Buffer.from(buf), transformation: { width: 560, height: 380 }, type: typeMap[ext] || 'png' })]
    })
  }

  const p1Para = await makeScreenshotParagraph(screenshot1, 'アメリカ・英語でのプレスリリースタイトル検索結果')
  const p2Para = await makeScreenshotParagraph(screenshot2, 'アメリカ・英語でのサービス名「UZU Advertising」検索結果')
  const p3Para = await makeScreenshotParagraph(screenshot3, 'アメリカ・英語での会社名「APOC Co., Ltd.」検索結果')

  // Format date
  const dateFormatted = date ? `${date.replace(/-/g, '年').replace(/年(\d{2})$/, '月$1日').replace(/月(\d)$/, '月0$1日')}` : ''

  const siteRows = sites.map((s: any, i: number) => new TableRow({
    children: [
      dataCell(String(i + 1), colWidths[0], true),
      dataCell(s.name, colWidths[1]),
      linkCell(s.url, s.url, colWidths[2]),
      dataCell(s.mediaType, colWidths[3], true),
      dataCell(s.sessions, colWidths[4], true),
    ]
  }))

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
      paragraphStyles: [{
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '1F4E79' },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 }
      }]
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'Global Press プレスリリース配信レポート', bold: true, size: 32, font: 'Arial', color: '1F4E79' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 400 }, children: [new TextRun({ text: 'ご依頼いただきましたプレスリリースの配信が完了しましたので、下記の通りご報告いたします。', size: 20, font: 'Arial' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '■目次', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        ...['1. 配信概要', '2. 掲載サイト', '3. 配信現地国からの見え方', '4. 記事化事例', '5. 連絡先'].map(t =>
          new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: t, font: 'Arial', size: 20 })] })
        ),
        new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun('')] }),

        // 1. 配信概要
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '１　配信概要', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA }, columnWidths: [2300, 7060],
          rows: [
            new TableRow({ children: [
              new TableCell({ borders, width: { size: 2300, type: WidthType.DXA }, shading: headerShading, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '項目', bold: true, color: 'FFFFFF', font: 'Arial', size: 18 })] })] }),
              new TableCell({ borders, width: { size: 7060, type: WidthType.DXA }, shading: headerShading, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '内容', bold: true, color: 'FFFFFF', font: 'Arial', size: 18 })] })] }),
            ]}),
            ...[['記事タイトル', title], ['配信国 / 配信言語', country], ['配信カテゴリー', category], ['配信日', dateFormatted]].map(([label, value], i) =>
              new TableRow({ children: [
                new TableCell({ borders, width: { size: 2300, type: WidthType.DXA }, shading: i % 2 === 0 ? { fill: 'EBF3FB', type: ShadingType.CLEAR } : { fill: 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, bold: true, font: 'Arial', size: 18 })] })] }),
                new TableCell({ borders, width: { size: 7060, type: WidthType.DXA }, shading: i % 2 === 0 ? { fill: 'EBF3FB', type: ShadingType.CLEAR } : { fill: 'FFFFFF', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: value, font: 'Arial', size: 18 })] })] }),
              ]})
            )
          ]
        }),
        new Paragraph({ spacing: { before: 120, after: 300 }, children: [new TextRun({ text: '※プレスリリース配信後のレポート参考例', font: 'Arial', size: 15, color: '666666' })] }),

        // 2. 掲載サイト
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '２　掲載サイト', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        new Table({
          width: { size: 9360, type: WidthType.DXA }, columnWidths: colWidths,
          rows: [
            new TableRow({ children: [headerCell('#', colWidths[0]), headerCell('サイト名', colWidths[1]), headerCell('URL', colWidths[2]), headerCell('メディア形態 ※1', colWidths[3]), headerCell('月間想定セッション数（2025年3月）※2・3', colWidths[4])] }),
            ...siteRows
          ]
        }),
        new Paragraph({ spacing: { before: 100, after: 60 }, children: [new TextRun({ text: '※1：月間想定セッション数より、大規模メディア：50,000,000以上、中規模メディア：49,999,999〜1,000,000、小規模メディア：999,999〜10,000、ブログ・個人サイト：9,999〜n/aと定義', font: 'Arial', size: 15, color: '666666' })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: '※2：Similarwebの数値を参考（n/aにつきましては、当該サイトにてデータが確認できないものとなります）', font: 'Arial', size: 15, color: '666666' })] }),
        new Paragraph({ spacing: { before: 0, after: 300 }, children: [new TextRun({ text: '※3：「セッション数」とは、訪問者が1つ以上のページにアクセスした場合に、ウェブサイトのセッションとみなし、30分以内に同じサイトへのアクセスがあった場合は同じセッションとみなされます。', font: 'Arial', size: 15, color: '666666' })] }),

        // 3. 配信現地国からの見え方
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '３　配信現地国からの見え方', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        new Paragraph({ spacing: { before: 0, after: 180 }, children: [new TextRun({ text: '配信対象国であるアメリカにおいて言語設定を英語にした上で、プレスリリースタイトル、サービス名、会社名についてそれぞれ検索をした際の見え方は以下の通りです。', font: 'Arial', size: 20 })] }),

        new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: '■パターン①：プレスリリースタイトルでGoogle検索', bold: true, font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: '・検索上位及びそれ以降にも配信したプレスリリースが表示', font: 'Arial', size: 20 })] }),
        p1Para,

        new Paragraph({ spacing: { before: 180, after: 60 }, children: [new TextRun({ text: '■パターン②：サービス名「UZU Advertising」でGoogle検索', bold: true, font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: '・検索上位及びそれ以降にも配信したプレスリリースが表示', font: 'Arial', size: 20 })] }),
        p2Para,

        new Paragraph({ spacing: { before: 180, after: 60 }, children: [new TextRun({ text: '■パターン③：会社名「APOC Co., Ltd.」でGoogle検索', bold: true, font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [new TextRun({ text: '・検索上位及びそれ以降にも配信したプレスリリースが表示', font: 'Arial', size: 20 })] }),
        p3Para,

        // 4. 記事化事例
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '４　記事化事例', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        new Paragraph({ spacing: { before: 0, after: 300 }, children: [new TextRun({ text: '記事化事例は確認できませんでした。', font: 'Arial', size: 20, color: '666666' })] }),

        // 5. 連絡先
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: '５　連絡先', font: 'Arial', size: 28, bold: true, color: '1F4E79' })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: '株式会社APOC　齋藤', bold: true, font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: '03-6823-8848', font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [new ExternalHyperlink({ link: 'mailto:shunsuke.saito@apocc.co.jp', children: [new TextRun({ text: 'shunsuke.saito@apocc.co.jp', style: 'Hyperlink', font: 'Arial', size: 20 })] })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: '多言語プレスリリース配信サービス「Global Press」', bold: true, font: 'Arial', size: 20 })] }),
        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new ExternalHyperlink({ link: 'https://globalpress.ai/', children: [new TextRun({ text: 'https://globalpress.ai/', style: 'Hyperlink', font: 'Arial', size: 20 })] })] }),
        new Paragraph({ spacing: { before: 360, after: 0 }, alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '以上', font: 'Arial', size: 20 })] }),
      ]
    }]
  })

  const buffer = await Packer.toBuffer(doc)
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="GlobalPress_Report.docx"`,
    }
  })
}

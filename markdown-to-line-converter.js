/**
 * n8n 函數：將 AI 輸出的 markdown 內容轉換為 LINE 相容的 JSON 結構
 * 
 * 使用方式：
 * 1. 在 n8n 中創建一個 Code 節點
 * 2. 將此程式碼貼入 Code 節點
 * 3. 確保輸入資料包含 markdown 內容
 * 4. 輸出將是 LINE 可以使用的 JSON 結構
 */

// 取得輸入的 markdown 內容
const inputData = $input.all();

// 檢查是否有輸入資料
if (!inputData || inputData.length === 0) {
    throw new Error('沒有輸入資料。請確保前一個節點有輸出資料。');
}

// 檢查第一個項目是否存在且有 json 屬性
if (!inputData[0] || !inputData[0].json) {
    throw new Error('輸入資料格式不正確。請確保資料包含 json 物件。');
}

const markdownContent = inputData[0].json.markdown || inputData[0].json.content || inputData[0].json.text || inputData[0].json.output || '';

/**
 * 解析 markdown 並轉換為 LINE Flex Message 格式
 * @param {string} markdown - 輸入的 markdown 文字
 * @returns {object} LINE Flex Message 物件
 */
function parseMarkdownToLineFormat(markdown) {
    // 初始化 LINE Flex Message 結構
    const flexMessage = {
        type: "flex",
        altText: "AI 回應",
        contents: {
            type: "bubble",
            size: "giga",  // 使用 giga 尺寸讓訊息最寬
            body: {
                type: "box",
                layout: "vertical",
                contents: [],
                spacing: "sm",  // 增加元件間距
                paddingAll: "lg"  // 增加內邊距
            }
        }
    };

    // 分割 markdown 內容為行
    const lines = markdown.split('\n');
    let currentSection = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') {
            // 空行，添加分隔符
            if (flexMessage.contents.body.contents.length > 0) {
                flexMessage.contents.body.contents.push({
                    type: "separator",
                    margin: "md"
                });
            }
            continue;
        }
        
        // 處理標題 (# ## ###)
        if (line.startsWith('#')) {
            const level = line.match(/^#+/)[0].length;
            const title = line.replace(/^#+\s*/, '');
            
            flexMessage.contents.body.contents.push({
                type: "text",
                text: title,
                weight: level <= 2 ? "bold" : "regular",
                size: level === 1 ? "lg" : level === 2 ? "md" : "sm",  // 調整標題大小
                color: level <= 2 ? "#1e3a8a" : "#666666",  // 粗體標題使用深藍色
                margin: "md",
                wrap: true  // 讓標題也能換行
            });
            continue;
        }
        
        // 處理粗體文字 (**text**)
        if (line.includes('**')) {
            const processedText = line.replace(/\*\*(.*?)\*\*/g, '$1');
            flexMessage.contents.body.contents.push({
                type: "text",
                text: processedText,
                weight: "bold",
                color: "#1e3a8a",  // 粗體文字使用深藍色
                margin: "sm",
                wrap: true,  // 讓粗體文字也能換行
                size: "sm"
            });
            continue;
        }
        
        // 處理斜體文字 (*text*)
        if (line.includes('*') && !line.includes('**')) {
            const processedText = line.replace(/\*(.*?)\*/g, '$1');
            flexMessage.contents.body.contents.push({
                type: "text",
                text: processedText,
                margin: "sm",
                size: "sm",
                wrap: true
            });
            continue;
        }
        
        // 處理清單項目 (- 或 *)
        if (line.startsWith('-') || line.startsWith('*')) {
            const listItem = line.replace(/^[-*]\s*/, '• ');
            flexMessage.contents.body.contents.push({
                type: "text",
                text: listItem,
                margin: "sm",
                color: "#555555",
                wrap: true,  // 讓清單項目也能換行
                size: "sm"
            });
            continue;
        }
        
        // 處理編號清單 (1. 2. 3.)
        if (/^\d+\.\s/.test(line)) {
            flexMessage.contents.body.contents.push({
                type: "text",
                text: line,
                margin: "sm",
                color: "#555555",
                wrap: true,  // 讓編號清單也能換行
                size: "sm"
            });
            continue;
        }
        
        // 處理程式碼區塊 (```)
        if (line.startsWith('```')) {
            // 跳過程式碼區塊的開始標記
            i++;
            let codeContent = '';
            
            // 收集程式碼內容直到結束標記
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeContent += lines[i] + '\n';
                i++;
            }
            
            if (codeContent.trim()) {
                flexMessage.contents.body.contents.push({
                    type: "text",
                    text: codeContent.trim(),
                    color: "#333333",
                    margin: "md",
                    size: "sm",
                    wrap: true
                });
            }
            continue;
        }
        
        // 處理內聯程式碼 (`code`)
        if (line.includes('`')) {
            const processedText = line.replace(/`(.*?)`/g, '$1');
            flexMessage.contents.body.contents.push({
                type: "text",
                text: processedText,
                color: "#333333",
                margin: "sm",
                size: "sm",
                wrap: true
            });
            continue;
        }
        
        // 處理連結 [text](url)
        if (line.includes('[') && line.includes('](')) {
            const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (linkMatch) {
                const linkText = linkMatch[1];
                const linkUrl = linkMatch[2];
                
                flexMessage.contents.body.contents.push({
                    type: "text",
                    text: linkText,
                    color: "#0066cc",
                    decoration: "underline",
                    action: {
                        type: "uri",
                        uri: linkUrl
                    },
                    margin: "sm"
                });
                continue;
            }
        }
        
        // 處理引用 (>)
        if (line.startsWith('>')) {
            const quoteText = line.replace(/^>\s*/, '');
            flexMessage.contents.body.contents.push({
                type: "text",
                text: `"${quoteText}"`,
                color: "#666666",
                margin: "md",
                size: "sm",
                wrap: true
            });
            continue;
        }
        
        // 處理一般文字
        if (line.length > 0) {
            flexMessage.contents.body.contents.push({
                type: "text",
                text: line,
                wrap: true,
                margin: "sm",
                size: "sm"  // 使用較小字體以容納更多內容
            });
        }
    }
    
    return flexMessage;
}

/**
 * 創建簡化的 LINE 文字訊息格式（備用方案）
 * @param {string} markdown - 輸入的 markdown 文字
 * @returns {object} LINE 文字訊息物件
 */
function createSimpleTextMessage(markdown) {
    // 移除 markdown 格式標記，保留純文字
    let cleanText = markdown
        .replace(/#{1,6}\s*/g, '') // 移除標題標記
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗體標記
        .replace(/\*(.*?)\*/g, '$1') // 移除斜體標記
        .replace(/`(.*?)`/g, '$1') // 移除內聯程式碼標記
        .replace(/```[\s\S]*?```/g, '[程式碼]') // 替換程式碼區塊
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除連結格式，保留文字
        .replace(/^>\s*/gm, '') // 移除引用標記
        .replace(/^[-*]\s*/gm, '• ') // 轉換清單項目
        .trim();
    
    return {
        type: "text",
        text: cleanText
    };
}

// 主要處理邏輯
try {
    if (!markdownContent) {
        throw new Error('找不到 markdown 內容。請確保輸入資料包含 markdown、content、text 或 output 欄位。');
    }
    
    // 檢查 markdown 內容長度，決定使用哪種格式
    const useFlexMessage = markdownContent.length < 3000; // LINE Flex Message 有長度限制
    
    let lineMessage;
    
    if (useFlexMessage) {
        // 使用 Flex Message 格式（支援豐富格式）
        lineMessage = parseMarkdownToLineFormat(markdownContent);
    } else {
        // 使用簡單文字格式（適用於長文字）
        lineMessage = createSimpleTextMessage(markdownContent);
    }
    
    // 返回 n8n 相容的資料結構
    return [{
        json: {
            output: lineMessage
        }
    }];
    
} catch (error) {
    // 錯誤處理
    console.error('Markdown 轉換錯誤:', error.message);
    
    return [{
        json: {
            output: {
                type: "text",
                text: "抱歉，處理您的訊息時發生錯誤。請稍後再試。"
            }
        }
    }];
}
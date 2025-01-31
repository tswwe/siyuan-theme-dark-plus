/* 复制加强 */

import { config } from './config.js';
import { isKey } from './../utils/hotkey.js';
import {
    exportMdContent,
    updateBlock,
} from './../utils/api.js';

async function docCopy() {
    const background = document.querySelector('div.layout__wnd--active div.protyle:not(.fn__none)>div.protyle-content>div.protyle-background');
    if (background) {
        let id = background.dataset.nodeId;
        if (id) {
            let data = await exportMdContent(id);
            if (data) {
                let content = data.content;
                navigator.clipboard.writeText(content);
            }
        }
    }
}

async function docDelete() {
    const background = document.querySelector('div.layout__wnd--active div.protyle:not(.fn__none)>div.protyle-content>div.protyle-background');
    if (background) {
        let id = background.dataset.nodeId;
        if (id) {
            await updateBlock(
                id,
                'markdown',
                '',
            );
        }
    }
}

async function docCut() {
    const background = document.querySelector('div.layout__wnd--active div.protyle:not(.fn__none)>div.protyle-content>div.protyle-background');
    if (background) {
        let id = background.dataset.nodeId;
        if (id) {
            let data = await exportMdContent(id);
            if (data) {
                let content = data.content;
                navigator.clipboard.writeText(content);
                await updateBlock(
                    id,
                    'markdown',
                    '',
                );
            }
        }
    }
}

const MAP = {
    outline: {
        style: {
            list: {
                'o': (_) => `${_}. `,
                'u': (_) => '* ',
                't': (_) => '* [ ] ',
            },
            content: {
                'text': (text, id, title) => text,
                'link': (text, id, title) => `[${text}](siyuan://blocks/${id}${title ? ` "${title}" ` : ''})`,
                'ref': (text, id, title) => `(${id} "${title}")`,
            },
        },
    },
}

function outlineCopy(mode) {
    const outline = document.querySelector('.sy__outline .b3-list.b3-list--background');
    const content = MAP.outline.style.content[config.theme.doc.outline.style.content];
    if (outline) {
        let mark = MAP.outline.style.list[mode];
        let markdown = [];
        function outlineParser(node, deep = 0, index = 0) {
            // 大纲解析器
            switch (node.nodeName) {
                case 'LI':
                    let text = node.querySelector('.b3-list-item__text').innerText;
                    let id = node.dataset.nodeId;
                    markdown.push(`${' '.repeat(deep * 4)}${mark(++index)}${content(text, id)}`);
                    break;
                case 'UL':
                    markdown.push('');
                    for (index in node.childNodes) {
                        outlineParser(node.childNodes[index], deep + 1, index);
                    }
                    break;
                default:
                    return;
            }
        }

        switch (config.theme.doc.outline.top) {
            case 'd':
                outlineParser(outline.firstElementChild);
                outlineParser(outline.lastElementChild);
                break;
            case 'h':
                outlineParser(outline.lastElementChild, -1);
                break;
            default:
                return;
        }
        navigator.clipboard.writeText(markdown.join('\n'));
    }
}


(() => {
    try {
        if (config.theme.doc.copy) {
            let body = document.body;

            if (config.theme.doc.copy.enable) {
                // 复制当前文档全部内容至剪贴板
                body.addEventListener('keyup', (e) => {
                    // console.log(e);
                    if (isKey(e, config.theme.hotkeys.doc.copy)) {
                        setTimeout(docCopy, 0);
                    }
                });
            }

            if (config.theme.doc.delete.enable) {
                // 删除当前文档全文
                body.addEventListener('keyup', (e) => {
                    if (isKey(e, config.theme.hotkeys.doc.delete)) {
                        // console.log(e);
                        setTimeout(docDelete, 0);
                    }
                });
            }

            if (config.theme.doc.cut.enable) {
                // 剪切当前文档全文
                body.addEventListener('keyup', (e) => {
                    if (isKey(e, config.theme.hotkeys.doc.cut)) {
                        // console.log(e);
                        setTimeout(docCut, 0);
                    }
                });
            }

            if (config.theme.doc.outline.enable) {
                // 复制当前文档大纲
                body.addEventListener('keyup', (e) => {
                    if (isKey(e, config.theme.hotkeys.doc.outline.o)) {
                        // console.log(e);
                        setTimeout(() => outlineCopy('o'), 0);
                    }
                });
                body.addEventListener('keyup', (e) => {
                    if (isKey(e, config.theme.hotkeys.doc.outline.u)) {
                        // console.log(e);
                        setTimeout(() => outlineCopy('u'), 0);
                    }
                });
                body.addEventListener('keyup', (e) => {
                    if (isKey(e, config.theme.hotkeys.doc.outline.t)) {
                        // console.log(e);
                        setTimeout(() => outlineCopy('t'), 0);
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
})();
